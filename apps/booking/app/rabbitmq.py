import pika
import os
import json

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
QUEUE_NAME = "booking_notifications"

def send_booking_message(data: dict):
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST)
        )
        channel = connection.channel()

        channel.queue_declare(queue=QUEUE_NAME, durable=True)

        message = json.dumps(data)
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2  
            )
        )

        print(f"📤 Booking message sent to RabbitMQ:\n{message}")
        connection.close()

    except Exception as e:
        print(f"❌ Failed to send booking message to RabbitMQ: {e}")
