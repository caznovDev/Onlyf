import boto3
import os
from botocore.exceptions import NoCredentialsError, ClientError

def upload_to_s3(local_file, bucket, s3_file=None):
    """
    Uploads a file to an S3 bucket.
    
    :param local_file: Path to the local file
    :param bucket: Name of the S3 bucket
    :param s3_file: S3 object name. If not specified, local_file is used
    :return: True if successful, else False
    """
    if s3_file is None:
        s3_file = os.path.basename(local_file)

    # Initialize S3 client
    # Note: boto3 will automatically look for credentials in environment variables:
    # AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN
    s3 = boto3.client('s3')

    try:
        print(f"Uploading '{local_file}' to bucket '{bucket}' as '{s3_file}'...")
        s3.upload_file(local_file, bucket, s3_file)
        print("Upload Successful")
        return True
    except FileNotFoundError:
        print(f"The file '{local_file}' was not found")
        return False
    except NoCredentialsError:
        print("Credentials not available. Please check your AWS configuration.")
        return False
    except ClientError as e:
        print(f"An error occurred: {e}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False

if __name__ == "__main__":
    # Example usage
    # Replace these with your actual values or use environment variables
    FILE_TO_UPLOAD = 'data/output.csv'
    BUCKET_NAME = os.getenv('AWS_S3_BUCKET', 'your-bucket-name')
    S3_OBJECT_NAME = 'processed_data/output.csv'
    
    if os.path.exists(FILE_TO_UPLOAD):
        upload_to_s3(FILE_TO_UPLOAD, BUCKET_NAME, S3_OBJECT_NAME)
    else:
        print(f"File '{FILE_TO_UPLOAD}' does not exist. Run the processing script first.")
