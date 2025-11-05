import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing auth router import...")
    from routes.auth import router
    print(f"✓ Auth router imported successfully!")
    print(f"✓ Router prefix: {router.prefix}")
    print(f"✓ Routes found: {len(router.routes)}")
    for route in router.routes:
        if hasattr(route, 'path'):
            print(f"  - {route.methods if hasattr(route, 'methods') else 'N/A'} {route.path}")
    print("\n✓ All checks passed! Auth router is ready.")
except ImportError as e:
    print(f"✗ Import error: {e}")
    print("\nPlease install dependencies:")
    print("pip install python-jose[cryptography] resend bcrypt python-dotenv")
except Exception as e:
    print(f"✗ Error: {e}")

