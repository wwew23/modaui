<?php

return [
    'handoff_guide' => [
        'title' => 'AI Prompt 与接手开发文档',
        'description' => '为后续开发者、AI 自动化系统或产品运营人员提供本地 Prato 多商家商城 AI 配置、角色定位、文案规则及接手说明。',
        'last_updated' => '2026-05-30',
        'sections' => [
            [
                'id' => 'purpose',
                'title' => '目的与适用场景',
                'content' => '本文件用于说明当前 AI 系统的角色区分、配置位置、业务边界和交接要点。后续开发者或者自动化 AI 可直接读取此配置，避免重复开发或理解偏差。',
            ],
            [
                'id' => 'prompt_files',
                'title' => '关键配置文件',
                'content' => "主要文件：\n- config/ai.php：核心 AI system prompt 配置，包含前台 customer 和后台 merchant 两条角色提示。\n- config/ai_docs.php：本开发接手与知识文档说明，可用于补充业务规则、FAQ、行业说明和自动化提示。\n- app/Console/Commands/ChatWithAi.php：命令行对话工具，用于本地测试 AI 角色和 prompt 生效情况。\n- app/Console/Commands/TestAiIdentity.php：检查系统 prompt 是否正确加载并包含身份说明。",
            ],
            [
                'id' => 'ai_roles',
                'title' => 'AI 角色说明',
                'content' => "当前设计中有两个独立角色：\n\n1. 顾客端（/ai/customer）\n   - 角色：{{PLATFORM_NAME}} 平台的 AI 导购/客服。\n   - 服务对象：浏览商城的终端顾客。\n   - 主要职责：商品推荐、搭配建议、商品说明、订单与政策答疑、购物引导。\n   - 关键要求：不自称 Google/OpenAI/ChatGPT，不编造商品、政策、价格或活动。\n\n2. 商家端（/ai/merchant）\n   - 角色：某个店铺的 AI 运营店长助手。\n   - 服务对象：店铺管理团队（店主、运营、客服主管等）。\n   - 主要职责：销售分析、商品表现、客户结构、运营建议。\n   - 关键要求：所有分析基于工具数据，不凭空猜测，不承诺增长结果。",
            ],
            [
                'id' => 'prompt_placeholders',
                'title' => '占位符说明',
                'content' => "本 prompt 文案中保留了占位符，后续可由调用上下文或部署配置替换：\n- {{PLATFORM_NAME}}：平台名称，例如 ModaPrato、PratoFashionMall。\n- {{MARKET_NAME}}：市场或场景标签，例如 Prato 时尚批发市场。\n- {{STORE_NAME}}：后台店铺名称，占位符可用于具体店铺 context。\n\n建议：如果需要系统化替换，可在调用 AI 前将占位符用 context 或模板引擎替换为实际值。",
            ],
            [
                'id' => 'do_not',
                'title' => '禁止行为与边界',
                'content' => "必须明确：\n- 不要将前台 AI 描述为 Google/OpenAI/ChatGPT/大模型。\n- 不要凭空编造商品、价格、库存、运费、退货、政策或销售数据。\n- 对于系统未提供的数据，要说明'系统中没有这条信息/数据不足'，并给出下一步建议。\n- 后台 AI 不直接面向顾客，不提供客服式闲聊推荐。\n- 自动化开发不能重复开发已经存在的 prompt 逻辑，应该复用本文件中的规则。",
            ],
            [
                'id' => 'usage_guidelines',
                'title' => '开发接手与自动化使用指南',
                'content' => "后续接手的人或自动化 AI 应该遵循：\n\n1. 先读本文件和 config/ai.php，了解两个角色的定位与边界。\n2. 不要随意改动已有 prompt 的核心身份说明，除非业务名称变更。\n3. 如果新增业务规则，应先在 ai_docs.php 中补充说明，再同步到 ai.php。\n4. 对于新工具 data source，应在 AiTools 中统一实现并让 prompt 调用，而不是在 prompt 中写死数据。\n5. 若要调整前台/后台回答风格，只修改 prompt 文案，不要改变 core intent classification 逻辑。\n6. 需要排查时，优先运行 php artisan ai:test-identity 或 php artisan ai:chat。",
            ],
            [
                'id' => 'faq_examples',
                'title' => '典型 FAQ 与示例',
                'content' => "示例条目：\n- 前台：'这个外套适合秋天穿吗？'、'我想找一套约会穿的连衣裙，预算 100 欧以内'。\n- 后台：'最近 30 天店铺销售额怎么样？'、'哪个品类的转化率最高？'。\n\n这些示例应帮助接手开发人员理解 prompt 的实际输出类型。",
            ],
            [
                'id' => 'knowledge_base',
                'title' => '知识库与规则补充',
                'content' => "当前已有的知识库项用于回答常见政策类问题，如退货、运费、发货时间、发票、订单取消。\n后续可继续扩展：\n- 服装风格和搭配说明\n- 常见尺码与欧码转换规则\n- 多商家店铺风格标签\n- 促销与折扣使用规则（仅供推荐，不做实际下单说明）\n\n注意：文档内容应保持与 ai.php 中提示一致，避免出现前后不一致的回答。",
            ],
        ],
    ],
    'knowledge_base' => [
        [
            'id' => 'return_policy',
            'title' => '退货与退款政策',
            'category' => '售后政策',
            'summary' => '支持收到商品 7 天内无理由退货，需保持商品完好并附带凭证。',
            'content' => '本店支持收到商品 7 天内无理由退货，商品需保持完好、无异味、无二次包装损坏，并请保留发票与包装。若因质量问题退换，运费由本店承担；若非质量问题退货，运费由买家承担。',
            'keywords' => ['退货', '退款', '退换', '退货政策', '售后', '质量问题'],
            'tags' => ['after_sale', 'return'],
            'source' => '本地政策知识库',
        ],
        [
            'id' => 'shipping_fee',
            'title' => '运费与配送规则',
            'category' => '物流政策',
            'summary' => '全国大部分地区订单满 199 元包邮，不足则按物流公司标准运费收取。',
            'content' => '全国大部分地区订单满 199 元包邮，未满 199 元按物流公司标准费用收取。偏远地区可能存在额外运费，具体费用请以结算页面显示为准。特殊活动期间，店铺可另外支持指定地区包邮。',
            'keywords' => ['运费', '配送', '邮费', '快递', '包邮', '偏远地区'],
            'tags' => ['logistics', 'shipping'],
            'source' => '本地政策知识库',
        ],
        [
            'id' => 'shipping_time',
            'title' => '发货时效说明',
            'category' => '物流政策',
            'summary' => '订单一般在 1-2 个工作日内发出，节假日和高峰期可能延迟。',
            'content' => '订单一般在 1-2 个工作日内发出，周末及国家法定节假日除外。发货后具体到货时间取决于所选快递公司与收货地址，部分地区可能会有额外延迟。',
            'keywords' => ['发货', '多久', '配送时间', '发货时间', '到货'],
            'tags' => ['shipping', 'delivery'],
            'source' => '本地政策知识库',
        ],
        [
            'id' => 'invoice_policy',
            'title' => '发票开具规则',
            'category' => '支付与发票',
            'summary' => '订单中可填写发票信息，支持纸质发票和电子发票。',
            'content' => '如需发票，请在下单时填写发票抬头和税号。订单完成后也可联系客服申请开票，发票可支持纸质发票或电子发票，并可随快递寄出或通过邮件发送。',
            'keywords' => ['发票', '开票', '票据', '税号', '发票信息'],
            'tags' => ['invoice', 'billing'],
            'source' => '本地政策知识库',
        ],
        [
            'id' => 'order_cancel',
            'title' => '订单取消与修改流程',
            'category' => '订单政策',
            'summary' => '未发货前可联系客服取消或修改订单，发货后需走退货流程。',
            'content' => '若订单尚未发货，可联系客服申请取消或修改订单信息。若订单已发货，则需要等收货后通过退货流程处理，并按照退货政策返还金额。具体取消与修改以客服确认结果为准。',
            'keywords' => ['取消订单', '修改订单', '变更', '订单取消', '改地址'],
            'tags' => ['order', 'cancel'],
            'source' => '本地政策知识库',
        ],
    ],
];
