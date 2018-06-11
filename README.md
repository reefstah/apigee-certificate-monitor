# Apigee Certificate Monitor

A node script to scan the certificates and list the certificates getting 
expired in a specified time limit and send notification on slack channel.

## Prerequisites

To be able to use this script you should have:

- node v10.4.0
- npm v6.1.0

## Usage

To use the script you should first set the: 

- organization name
- User credentials in Base 64 encoded format
- Management API Host name
- Slack Webhook URL where the notification will be sent
