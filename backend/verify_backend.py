
import sys
import os
import importlib
from dotenv import load_dotenv

print("Starting backend verification...")

# 1. Check imports
required_modules = [
    "fastapi",
    "uvicorn",
    "google.generativeai",
    "chromadb",
    "pypdf",
    "dotenv"
]

print("\n1. Checking Python dependencies...")
missing_modules = []
for module_name in required_modules:
    try:
        importlib.import_module(module_name)
        print(f"  [OK] {module_name} imported successfully")
    except ImportError as e:
        print(f"  [FAIL] Could not import {module_name}: {e}")
        missing_modules.append(module_name)

if missing_modules:
    print(f"\nCRITICAL: Missing dependencies: {', '.join(missing_modules)}")
    sys.exit(1)

# 2. Check .env and API Key
print("\n2. Checking environment configuration...")
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    print(f"  [OK] .env file found at {env_path}")
    load_dotenv(env_path)
else:
    print(f"  [WARNING] .env file NOT found at {env_path}")
    # try loading from current directory just in case
    load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    # Check if it looks like a valid key (simple length check or prefix check if applicable, but length is safer)
    if len(api_key) > 20:
        print("  [OK] GOOGLE_API_KEY is set and seems valid (length check passed)")
    else:
        print("  [WARNING] GOOGLE_API_KEY is set but looks suspiciously short")
else:
    print("  [FAIL] GOOGLE_API_KEY is NOT set in environment variables")
    sys.exit(1)

# 3. Check Application Import (Syntax check primarily)
print("\n3. Verifying application integrity...")
try:
    # Append current directory to path to allow importing main
    sys.path.append(os.path.dirname(__file__))
    from main import app
    print("  [OK] Successfully imported 'app' from 'main.py'")
except Exception as e:
    print(f"  [FAIL] Failed to import application: {e}")
    sys.exit(1)

print("\n-------------------------------------------------------------")
print("VERIFICATION SUCCESSFUL: The backend server is ready to run.")
print("-------------------------------------------------------------")
sys.exit(0)
