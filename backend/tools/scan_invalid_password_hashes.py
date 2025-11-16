from pymongo import MongoClient
import os
import bcrypt


def is_valid_bcrypt_hash(hash_value: str) -> bool:
    """
    Perform a lightweight validation of a bcrypt hash.

    This is not exhaustive but catches obviously invalid values that would
    cause \"Invalid salt\" errors (e.g. plain text or truncated hashes).
    """
    if not isinstance(hash_value, str):
        return False

    hash_value = hash_value.strip()

    # Basic shape check: bcrypt hashes usually start with $2 and contain 3 '$'
    if not hash_value.startswith("$2") or hash_value.count("$") < 3:
        return False

    # Try a dummy check to let bcrypt validate the salt format
    try:
        bcrypt.checkpw(b"dummy-password", hash_value.encode("utf-8"))
        return True
    except ValueError:
        return False


def main() -> None:
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise RuntimeError("MONGO_URI environment variable is required to scan users")

    client = MongoClient(mongo_uri)
    db = client[os.getenv("DATABASE_NAME", "face_recognition_db")]
    users_collection = db["users"]

    invalid_users = []

    for user in users_collection.find({}, {"password": 1, "email": 1, "username": 1}):
        password_hash = user.get("password")
        if not password_hash or not is_valid_bcrypt_hash(password_hash):
            invalid_users.append(user)

    if not invalid_users:
        print("✅ All user password hashes look valid.")
        return

    print(f"⚠️ Found {len(invalid_users)} users with invalid password hashes:")
    for user in invalid_users:
        print(
            f" - id={user.get('_id')} email={user.get('email')} "
            f"username={user.get('username')} password={repr(user.get('password'))}"
        )

    print(
        "\nYou can fix these by either deleting the users and asking them to re-register "
        "or by updating the password field with a new bcrypt hash."
    )


if __name__ == \"__main__\":
    main()


