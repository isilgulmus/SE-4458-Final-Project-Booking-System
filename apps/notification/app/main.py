import pika
import os
import json
import time
from handler import handle_booking_message

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
QUEUE_NAME = "booking_notifications"

def start_consuming():
    while True:
        try:
            print("📡 Connecting to RabbitMQ...")
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
            channel = connection.channel()
            channel.queue_declare(queue=QUEUE_NAME, durable=True)

            def callback(ch, method, properties, body):
                try:
                    data = json.loads(body)
                    handle_booking_message(data)
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                except Exception as err:
                    print(f"❌ Error handling message: {err}")
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

            channel.basic_qos(prefetch_count=1)  # işleme sırası
            channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback)

            print(f"📡 Listening on queue: {QUEUE_NAME}")
            channel.start_consuming()

        except Exception as e:
            print(f"❌ Connection failed: {e}")
            print("🔁 Retrying in 5 seconds...")
            time.sleep(5)

if __name__ == "__main__":
    start_consuming()
