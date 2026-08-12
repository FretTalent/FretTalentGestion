@echo off
node -e "const fs = require('fs'); require('dotenv').config({path:'.env.local'}); fs.writeFileSync('.tmp2', process.env.STRIPE_PRICE_PREMIUM_PLUS);"
call npx vercel env rm STRIPE_PRICE_PREMIUM_PLUS production -y
call npx vercel env add STRIPE_PRICE_PREMIUM_PLUS production < .tmp2
call npx vercel --prod --yes
del .tmp2
