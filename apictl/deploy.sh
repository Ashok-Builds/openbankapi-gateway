#!/bin/bash
echo "Starting OpenBankAPI deployment..."
apictl login dev -u admin -p admin -k
apictl import api -f AccountsAPI_1.0.0.zip -e dev -k --update
apictl import api -f TransactionsAPI_1.0.0.zip -e dev -k --update
apictl import api -f PaymentsAPI_1.0.0.zip -e dev -k --update
echo "All APIs deployed successfully!"
