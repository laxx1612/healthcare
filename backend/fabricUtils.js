// fabricUtils.js

const { FabricCAServices } = require('fabric-ca-client');
const { Wallets } = require('fabric-network');

async function enrollAdmin() {
    try {
        // Create a new CA client for interacting with the CA server
        const caInfo = {
            url: 'http://localhost:7054', // Replace with your CA server URL
            caName: 'ca.example.com', // Replace with your CA name
            tlsOptions: {
                trustedRoots: [],
                verify: false
            },
            registrar: {
                enrollId: 'admin', // Replace with your registrar enroll ID
                enrollSecret: 'adminpw' // Replace with your registrar enroll secret
            }
        };
        const ca = new FabricCAServices(caInfo);

        // Enroll the admin user
        const enrollment = await ca.enroll({
            enrollmentID: 'admin',
            enrollmentSecret: 'adminpw'
        });

        // Create a wallet for the admin user
        const wallet = await Wallets.newFileSystemWallet('./wallet');
        
        // Store the admin identity in the wallet
        const identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP' // Replace with your organization's MSP ID
        };
        await wallet.put('admin', identity);

        console.log('Admin enrolled successfully');
    } catch (error) {
        console.error('Failed to enroll admin user:', error);
    }
}

// Call enrollAdmin function to enroll the admin user
enrollAdmin();

module.exports = { enrollAdmin };
