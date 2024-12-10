from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Request, status, BackgroundTasks, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from hashing import Hash
from fastapi import HTTPException, status
from jwttoken import create_access_token
from bson import ObjectId
from oauth import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime, timedelta
from jose import JWTError, jwt
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import uuid
import stripe
import yfinance as yf
import openai 
import os
from fastapi.responses import FileResponse
import pdfkit

app = FastAPI()
origins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "https://stockproject-flame.vercel.app"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mongodb_uri = "mongodb+srv://adisa:michellead@cluster0.d72xb.mongodb.net/stock-app?retryWrites=true&w=majority" # Replace with your MongoDB URI

port = 8000
client = MongoClient(mongodb_uri, port)
db = client["stock-app"]
SECRET_KEY = "KENNNY"
ALGORITHM = "HS256"


# Nodemailer SMTP 
SMTP_SERVER = "smtp.gmail.com"  # .
SMTP_PORT = 587  # For TLS encryption
SMTP_USER = "adamokehinde068@gmail.com"  # Replace with your email address 
SMTP_PASSWORD = "pfewksbciuqzjcdn"  # App password



class User(BaseModel):
    email: str
    password: str


class Login(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None

##updating user
class UserUpdate(BaseModel):
    email: EmailStr  # Ensure email is part of the model
    name: Optional[str] = None
    password: Optional[str] = None
    chatbot_tone: Optional[str] = None
    notifications: Optional[dict] = None
    confirm_password:Optional[str]=None

#subscription
class Subscription(BaseModel):
    plan_type: str  # 'weekly', 'monthly', 'yearly', 'lifetime'
    start_date: datetime
    end_date: Optional[datetime]
    status: str
    credits: int
    auto_renew: bool = True

class PaymentIntent(BaseModel):
    plan_type: str
    payment_method_id: str


class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: str = None
    issue: str
    comment: str = None

class ChatMessage(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []


class CurrentPlanResponse(BaseModel):
    name: str
    price: float
    next_billing_date: str

class Transaction(BaseModel):
    id: str
    date: str
    amount: float
    status: str



# Add these configurations
stripe.api_key="sk_test_51PaCuILCS3Ry0BK7h4kf4T92Ob92mJ4qNFlpy7sofWMYGjza9HTG8aKWGwtXLrhjNYE2pUwtutfErJpRHxRytdU100eA3rbwui"
openai.api_key="replace with your key"  



PLAN_PRICES = {
    "weekly": {
        "price": 6.11,
        "credits": 200,
        "stripe_price_id": "price_weekly"
    },
    "monthly": {
        "price": 21.11,
        "credits": 1000,
        "stripe_price_id": "price_monthly"
    },
    "yearly": {
        "price": 198.01 ,
        "credits": 15000,
        "stripe_price_id": "price_yearly"
    },
    
}


@app.get("/")
def index():
    return {"data": "Hello World"}


def create_email_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)  # Token valid for 24 hours
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Function to send the confirmation email
def send_confirmation_email(email: str, token: str):
    verification_link = f"https://stockproject-2c1r.onrender.com/verify-email?token={token}"
    email_content = MIMEMultipart()
    email_content["From"] = SMTP_USER
    email_content["To"] = email
    email_content["Subject"] = "Confirm your email"

    # HTML email body
    body = f"<p>Thank you for signing up! Please click <a href='{verification_link}'>here</a> to confirm your email address.</p>"
    email_content.attach(MIMEText(body, "html"))

    # Sending email via SMTP
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()  # Start TLS encryption
        server.login(SMTP_USER, SMTP_PASSWORD)  # Login to the SMTP server
        server.sendmail(SMTP_USER, email, email_content.as_string())  # Send the email



#register functionality
@app.post("/register")
def create_user(request: User, background_tasks: BackgroundTasks):
    # Check if email is already registered
    existing_user = db["users"].find_one({"email": request.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    # Hash the password and prepare user data
    hashed_pass = Hash.bcrypt(request.password)
    user_object = dict(request)
    user_object["password"] = hashed_pass
    user_object["is_verified"] = False  # New users are not verified initially

    # Insert user into the database
    result = db["users"].insert_one(user_object)
    user_id = str(result.inserted_id)  # Convert ObjectId to string for JSON compatibility

    # Generate email token and add to background tasks
    email_token = create_email_token({"sub": request.email})
    background_tasks.add_task(send_confirmation_email, request.email, email_token)
    
    # Return response with user ID
    return {
        "message": "User created. Please check your email to verify your account.",
        "user_id": user_id
    }

    #end of register

@app.get("/verify-email")
def verify_email(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
        
        user = db["users"].find_one({"email": email})
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        db["users"].update_one({"email": email}, {"$set": {"is_verified": True}})
        return {"message": "Email successfully verified!"}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")


@app.post("/login")
def login(request: Login):
    user = db["users"].find_one({"email": request.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No user found with the email: {request.email}",
        )

    if not Hash.verify(user["password"], request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user["email"]})

    return {"access_token": access_token, "token_type": "bearer"}


###code upwards works dont touch it






@app.put("/user/update")
async def update_user_settings(user_update: UserUpdate):
    user = db["users"].find_one({"email": user_update.email})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Password confirmation check
    if user_update.password and user_update.confirm_password:
        if user_update.password != user_update.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
    
    # Prepare update data
    update_data = {}
    if user_update.name is not None:
        update_data["name"] = user_update.name
    if user_update.password is not None:
        # Hash the password before saving
        update_data["password"] = Hash.bcrypt(user_update.password)
    if user_update.chatbot_tone is not None:
        update_data["chatbot_tone"] = user_update.chatbot_tone
    if user_update.notifications is not None:
        update_data["notifications"] = user_update.notifications

    db["users"].update_one({"email": user_update.email}, {"$set": update_data})
    return {"message": "User settings updated successfully"}





@app.delete("/user/delete")
async def delete_user(email: EmailStr = Query(...)):
    user = db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db["users"].delete_one({"email": email})
    return {"message": "User account deleted successfully"}



##support

# Function to send the support email (for contact support)
# Function to send the support email (for contact support)
def send_support_email(contact_data: ContactForm):
    message = MIMEMultipart()
    message["From"] = SMTP_USER
    message["To"] = SMTP_USER  # The email that will receive the support request
    message["Subject"] = f"Support Request: {contact_data.issue}"

    body = f"""
    Name: {contact_data.name}
    Email: {contact_data.email}
    Phone: {contact_data.phone or "N/A"}
    Issue: {contact_data.issue}
    Additional Info: {contact_data.comment or "N/A"}
    """
    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()  # Start TLS encryption
        server.login(SMTP_USER, SMTP_PASSWORD)  # Login to the SMTP server
        server.sendmail(SMTP_USER, SMTP_USER, message.as_string())  # Send the support email


        #support
@app.post("/api/contact-support")
async def contact_support(contact_data: ContactForm, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_support_email, contact_data)
    return {"message": "Your support request has been received"}



#chat
class StockInfo:
    def __init__(self, symbol: str):
        self.ticker = yf.Ticker(symbol)
    
    def get_info(self) -> Optional[Dict[str, Any]]:
        try:
            info = self.ticker.info
            if info:
                return {
                    'symbol': self.ticker.ticker,
                    'price': info.get('regularMarketPrice', 'N/A'),
                    'change': info.get('regularMarketChangePercent', 'N/A'),
                    'volume': info.get('regularMarketVolume', 'N/A'),
                    'market_cap': info.get('marketCap', 'N/A'),
                    'pe_ratio': info.get('forwardPE', 'N/A'),
                    'fifty_two_week_high': info.get('fiftyTwoWeekHigh', 'N/A'),
                    'fifty_two_week_low': info.get('fiftyTwoWeekLow', 'N/A')
                }
        except:
            return None

def get_stock_data(symbol: str) -> Optional[Dict[str, Any]]:
    """Get real-time stock data for the AI to reference"""
    stock = StockInfo(symbol)
    return stock.get_info()

def extract_stock_symbols(text: str) -> List[str]:
    """Extract potential stock symbols from text"""
    # ... (same as previous version) ...

@app.post("/api/chat")
async def chat(request: ChatMessage):
    try:
        # Extract stock symbols from the message
        symbols = extract_stock_symbols(request.message) or []
        
        # Get real-time stock data for mentioned symbols
        stock_data = {}
        for symbol in symbols:
            stock_info = get_stock_data(symbol)
            if stock_info is not None:  # Add only valid stock info
                stock_data[symbol] = stock_info
        
        # Prepare system message with real-time data
        system_message = """You are a stock market analysis AI assistant. You help users understand stock market trends,
        analyze companies, and make informed investment decisions. Always provide balanced, analytical responses and remind 
        users that this is not financial advice."""
        if stock_data:
            system_message += "\nHere is the current stock data for reference:\n"
            for symbol, data in stock_data.items():
                system_message += (f"{symbol}: Price=${data['price']} ({data['change']}% change), "
                                   f"Volume={data['volume']}, Market Cap=${data['market_cap']}, "
                                   f"P/E={data['pe_ratio']}\n")
        
        # Prepare conversation history
        messages = [{"role": "system", "content": system_message}]
        
        # Add conversation history if provided
        if request.conversation_history:
            for msg in request.conversation_history[-5:]:
                messages.append({
                    "role": "user" if msg["type"] == "user" else "assistant",
                    "content": msg["content"]
                })
        
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        # Get response from OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        # Extract and format the response
        ai_response = response.choices[0].message.content
        
        return {"response": ai_response}
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"response": "I apologize, but I encountered an error processing your request. Please try again or rephrase your question."}


##get_customer_userif
def get_customer_by_user_id(user_id: str):
    # Query the users collection for a customer with the specified user_id
    customer = db["users"].find_one({"_id": user_id})
    if not customer or "stripe_customer_id" not in customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer



#billing and subscription
@app.get("/billing/current-plan", response_model=CurrentPlanResponse)
async def get_current_plan(user_id: str):
    customer = get_customer_by_user_id(user_id)  
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    subscriptions = stripe.Subscription.list(
        customer=customer.stripe_customer_id,
        status="active",
        limit=1
    )
    
    if not subscriptions.data:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    subscription = subscriptions.data[0]
    plan = subscription["items"]["data"][0]["plan"]
    next_billing_date = subscription["current_period_end"]

    return {
        "name": plan["nickname"],
        "price": plan["amount"] / 100,  # Convert cents to dollars
        "next_billing_date": next_billing_date,
    }

# Retrieve payment methods
@app.get("/billing/payment-methods")
async def get_payment_methods(user_id: str):
    customer = get_customer_by_user_id(user_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    payment_methods = stripe.PaymentMethod.list(
        customer=customer.stripe_customer_id,
        type="card"
    )

    return {
        "payment_methods": [
            {
                "id": pm["id"],
                "last4": pm["card"]["last4"],
                "brand": pm["card"]["brand"],
                "exp_month": pm["card"]["exp_month"],
                "exp_year": pm["card"]["exp_year"],
            }
            for pm in payment_methods.data
        ]
    }

# Get transaction history
@app.get("/billing/transactions", response_model=List[Transaction])  # Use List[Transaction] instead of list[Transaction]
async def get_transactions(user_id: str):
    customer = get_customer_by_user_id(user_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    charges = stripe.Charge.list(
        customer=customer.stripe_customer_id,
        limit=10
    )

    return [
        Transaction(
            id=charge["id"],
            date=charge["created"],
            amount=charge["amount"] / 100,  # Convert cents to dollars
            status=charge["status"],
        )
        for charge in charges.data
    ]

# Generate PDF
@app.get("/billing/transactions/{transaction_id}/download-pdf")
async def download_invoice_pdf(transaction_id: str):
    charge = stripe.Charge.retrieve(transaction_id)
    if not charge:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Create HTML template for PDF generation (use a real template in production)
    html_content = f"""
    <h1>Invoice for Transaction {charge['id']}</h1>
    <p>Date: {charge['created']}</p>
    <p>Amount: ${charge['amount'] / 100}</p>
    <p>Status: {charge['status']}</p>
    """
    pdf_path = f"/tmp/invoice_{transaction_id}.pdf"
    pdfkit.from_string(html_content, pdf_path)

    return FileResponse(pdf_path, filename=f"invoice_{transaction_id}.pdf")



#pricing and subscription
##subscription
@app.get("/api/user/credits")
async def get_user_credits(current_user: User = Depends(get_current_user)):
    user = db["users"].find_one({"email": current_user.email})
    return {"credits": user.get("credits", 50)}



##subscription plans

@app.get("/api/subscription/plans")
async def get_subscription_plans():
    return PLAN_PRICES

@app.get("/api/user/subscription")
async def get_user_subscription(current_user: User = Depends(get_current_user)):
    user = db["users"].find_one({"email": current_user.email})
    subscription = user.get("subscription")
    return subscription or {"status": "none"}


#create payment intent
@app.post("/api/payment/create-intent")
async def create_payment_intent(
    payment_data: PaymentIntent,
    current_user: User = Depends(get_current_user)
):
    try:
        plan = PLAN_PRICES[payment_data.plan_type]
        print(plan)
        intent = stripe.PaymentIntent.create(
            amount=int(plan["price"] * 100),  # Convert to cents
            currency="usd",
            payment_method=payment_data.payment_method_id,
            customer=current_user.stripe_customer_id,
            confirm=True,
            return_url="https://stockproject-flame.vercel.app/payment/success"
        )
        
        # Update user subscription
        end_date = None
        if payment_data.plan_type != "lifetime":
            duration_map = {
                "weekly": timedelta(days=7),
                "monthly": timedelta(days=30),
                "yearly": timedelta(days=365)
            }
            end_date = datetime.utcnow() + duration_map[payment_data.plan_type]
        
        subscription = {
            "plan_type": payment_data.plan_type,
            "start_date": datetime.utcnow(),
            "end_date": end_date,
            "status": "active",
            "credits": plan["credits"],
            "auto_renew": True
        }
        
        db["users"].update_one(
            {"email": current_user.email},
            {
                "$set": {
                    "subscription": subscription,
                    "credits": plan["credits"]
                }
            }
        )
        
        return {"client_secret": intent.client_secret}
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

#end of create payment intent
@app.post("/api/payment/create-intent")
async def create_payment_intent(
    payment_data: PaymentIntent,
    current_user: User = Depends(get_current_user)
):
    try:
        plan = PLAN_PRICES[payment_data.plan_type]
        print(plan)
        
        # For testing: Set default payment method to 'pm_card_visa' if in test mode
        payment_method_id = payment_data.payment_method_id or "pm_card_visa"

        # Create Payment Intent
        intent = stripe.PaymentIntent.create(
            amount=int(plan["price"] * 100),  # Convert to cents
            currency="usd",
            payment_method=payment_method_id,
            customer=current_user.stripe_customer_id,
            confirm=True,
            return_url="https://stockproject-flame.vercel.app/payment/success"
        )

        # Handle subscription details
        end_date = None
        if payment_data.plan_type != "lifetime":
            duration_map = {
                "weekly": timedelta(days=7),
                "monthly": timedelta(days=30),
                "yearly": timedelta(days=365)
            }
            end_date = datetime.utcnow() + duration_map[payment_data.plan_type]

        subscription = {
            "plan_type": payment_data.plan_type,
            "start_date": datetime.utcnow(),
            "end_date": end_date,
            "status": "active",
            "credits": plan["credits"],
            "auto_renew": True
        }

        # Update user subscription in database
        db["users"].update_one(
            {"email": current_user.email},
            {
                "$set": {
                    "subscription": subscription,
                    "credits": plan["credits"]
                }
            }
        )

        return {"client_secret": intent.client_secret}
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


##subscription cancelation

@app.put("/api/subscription/cancel")
async def cancel_subscription(current_user: User = Depends(get_current_user)):
    user = db["users"].find_one({"email": current_user.email})
    subscription = user.get("subscription")
    
    if not subscription or subscription["status"] != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription found"
        )
    
    db["users"].update_one(
        {"email": current_user.email},
        {"$set": {"subscription.auto_renew": False}}
    )
    
    return {"message": "Subscription cancelled successfully"}

