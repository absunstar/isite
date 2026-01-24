openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem


# 1. Generate a new private key
openssl genrsa -out private.key 2048

# 2. Generate a self-signed certificate (valid for 365 days in this example)
openssl req -x509 -new -sha256 -days 3650 -key private.key -out certificate.crt

# 3. Combine them into a PFX file
openssl pkcs12 -export -inkey private.key -in certificate.crt -out certificate.pfx

P@$$W)RDP@$$w0rd