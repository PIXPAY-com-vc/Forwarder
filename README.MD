# USDT Forwarder Script

This script monitors a receiving wallet for incoming USDT transactions on the Polygon network, sends MATIC to cover gas fees, and forwards the USDT to a hot wallet.

## Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/PIXPAY.COM.VC/usdt-forwarder.git
    cd usdt-forwarder
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the following variables:
    ```env
    POLYGON_RPC_URL=your_polygon_rpc_url
    RECEIVING_WALLET_PRIVATE_KEY=your_receiving_wallet_private_key
    HOT_WALLET_PRIVATE_KEY=your_hot_wallet_private_key
    USDT_ADDRESS=usdt_contract_address_on_polygon
    ```

4. Run the script:
    ```sh
    node forward.js
    ```

## How It Works

- The script uses ethers.js to connect to the Polygon network.
- It monitors the receiving wallet for incoming USDT transactions.
- When a USDT transaction is detected, the script sends MATIC to the receiving wallet to cover gas fees.
- It then forwards the USDT to the hot wallet.


## Tips

- On a monitoring system of multiwallets you can follow the same approach, changing the monitoring to a smartcontract event and detecting the receiving wallet of your system.

## Dependencies

- ethers.js
- dotenv
