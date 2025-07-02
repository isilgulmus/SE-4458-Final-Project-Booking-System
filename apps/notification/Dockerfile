FROM python:3.11

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir -r requirements.txt
RUN echo "📂 Contents of /app:" && ls -R /app

CMD ["python", "-u", "app/main.py"]
