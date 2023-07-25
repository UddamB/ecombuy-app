from time import sleep

def notify_customers(message):
    print('Sending 10k emails...')
    print(message)
    sleep(10)
    print('Emails were successfully sent!')