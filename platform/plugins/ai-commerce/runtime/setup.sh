#!/bin/bash
# 1. 注入 Token 到持久化存储
echo "正在注入 Shopify Token..."
node seed-tokens.js

# 2. 创建商家数据 (Prisma)
echo "正在初始化商家数据..."
cd ../admin && npx prisma db push && npx ts-node prisma/create-merchant.ts && cd ../api

echo "✅ 配置完成！"
