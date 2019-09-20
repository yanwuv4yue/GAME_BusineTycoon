scp -r ./web-mobile/ root@121.199.13.173:/usr/share/nginx/html

ssh root@121.199.13.173

cd /usr/share/nginx/html

rm -rf game/

mv web-mobile/ game/