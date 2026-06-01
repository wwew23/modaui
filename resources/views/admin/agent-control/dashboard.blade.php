@extends('layouts.admin')

@section('title', 'Agent 控制中心')

@section('head')
    <style>
        .admin-topbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 20px; }
        .section-tabs { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
        .section-tab { padding: 10px 16px; border-radius: 999px; border: 1px solid #d1d5db; background: #fff; color: #111827; cursor: pointer; transition: all .15s ease; }
        .section-tab.active { background: #111827; color: #fff; border-color: #111827; }
        .tab-panel { display: none; }
        .tab-panel.active { display: block; }
        .panel-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 18px; box-shadow: 0 1px 3px rgba(15, 23, 42, .05); }
        .section-header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 16px; }
        .section-header h2 { margin: 0; font-size: 1.17rem; }
        .button { display: inline-flex; align-items: center; gap: 8px; border: none; border-radius: 999px; padding: 10px 16px; cursor: pointer; background: #111827; color: #fff; font-weight: 600; }
        .button.secondary { background: #f3f4f6; color: #111827; }
        .button.danger { background: #b91c1c; }
        .button.small { padding: 8px 12px; font-size: .92rem; }
        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; background: #fff; }
        th, td { text-align: left; padding: 12px 14px; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 700; }
        tr:hover { background: #f9fafb; }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: .82rem; font-weight: 600; }
        .badge.enabled { background: #dcfce7; color: #166534; }
        .badge.disabled { background: #fee2e2; color: #991b1b; }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
        .json-editor { width: 100%; min-height: 260px; border: 1px solid #d1d5db; border-radius: 12px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; background: #111827; color: #f9fafb; resize: vertical; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, .45); z-index: 999; display: none; align-items: center; justify-content: center; }
        .modal-backdrop.active { display: flex; }
        .modal-card { width: min(100%, 900px); background: #fff; border-radius: 20px; box-shadow: 0 24px 60px rgba(15, 23, 42, .18); padding: 24px; position: relative; }
        .modal-card h3 { margin: 0 0 16px; }
        .modal-close { position: absolute; top: 16px; right: 16px; border: none; background: transparent; font-size: 1.4rem; cursor: pointer; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px; }
        .form-row label { display: block; font-weight: 600; margin-bottom: 6px; }
        .form-row input, .form-row select, .form-row textarea { width: 100%; border: 1px solid #d1d5db; border-radius: 10px; padding: 10px 12px; font-size: .95rem; }
        .workflow-canvas { position: relative; min-height: 320px; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border: 1px solid #d1d5db; border-radius: 16px; overflow: hidden; }
        .workflow-node { position: absolute; min-width: 150px; padding: 12px 14px; border-radius: 16px; background: #111827; color: #fff; box-shadow: 0 12px 24px rgba(0,0,0,.08); }
        .workflow-edge { position: absolute; pointer-events: none; }
        .notification { padding: 14px 18px; border-radius: 14px; margin-bottom: 18px; background: #ecfccb; color: #365314; border: 1px solid #d9f99d; }
        .editor-shell { display:grid; grid-template-columns: 280px minmax(0, 1.5fr) 320px; gap: 18px; align-items: start; }
        .editor-sidebar, .editor-assistant, .editor-main { display: flex; flex-direction: column; gap: 16px; }
        .editor-sidebar .panel-card, .editor-main .panel-card, .editor-assistant .panel-card { padding: 18px; }
        .editor-sidebar h3, .editor-main h3, .editor-assistant h3 { margin: 0 0 12px; font-size: 1.05rem; }
        .editor-menu { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        .editor-menu-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-radius: 14px; border: 1px solid #e5e7eb; background: #f8fafc; color: #111827; cursor: pointer; transition: all .15s ease; }
        .editor-menu-item.active { background: #111827; color: #fff; border-color: #111827; }
        .editor-menu-item span { font-size: .95rem; }
        .module-card { border: 1px solid #e5e7eb; border-radius: 18px; padding: 16px; background: #fff; box-shadow: 0 12px 24px rgba(15,23,42,.06); cursor: pointer; transition: transform .15s ease, box-shadow .15s ease; }
        .module-card:hover { transform: translateY(-1px); box-shadow: 0 18px 28px rgba(15,23,42,.12); }
        .module-card h4 { margin: 0 0 8px; font-size: 1rem; }
        .module-card p { margin: 0; color: #6b7280; font-size: .92rem; }
        .comparison-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
        .comparison-card { border: 1px solid #e5e7eb; border-radius: 18px; padding: 16px; background: #fff; }
        .comparison-card h4 { margin: 0 0 8px; font-size: .95rem; }
        .comparison-card p { margin: 0; color: #4b5563; }
        .theme-editor-canvas { border-radius: 20px; overflow: hidden; box-shadow: 0 24px 40px rgba(15,23,42,.08); background: #fff; min-height: 520px; }
        #gjs { min-height: 520px; border: none; }
        .editor-diff { border-radius: 20px; padding: 18px; background: #f8fafc; border: 1px solid #e5e7eb; }
        .editor-diff h4 { margin-top: 0; }
        .editor-diff ul { margin: 0; padding-left: 18px; color: #334155; }
        .editor-diff li { margin-bottom: 8px; }
        .section-detail-panels { display: grid; gap: 12px; margin-bottom: 16px; }
        .section-detail-panel { display: none; border: 1px solid #e5e7eb; border-radius: 18px; padding: 16px; background: #fff; }
        .section-detail-panel.active { display: block; }
        .section-detail-panel h4 { margin: 0 0 10px; }
        .section-detail-panel ul { margin: 0; padding-left: 18px; color: #334155; }
        .section-detail-panel li { margin-bottom: 8px; }
        #gjs-blocks { display: grid; grid-template-columns: 1fr; gap: 12px; padding: 14px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f8fafc; }
        .theme-editor-sidebar { position: sticky; top: 20px; }
        .theme-editor-sidebar .panel-card { padding: 18px; }
        .theme-editor-theme-preview { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
        .theme-editor-theme-chip { height: 42px; border-radius: 12px; box-shadow: inset 0 0 0 1px rgba(15,23,42,.06); display: flex; align-items: center; justify-content: center; font-size: .85rem; color: #111827; }
        .ai-command-input { width: 100%; border: 1px solid #d1d5db; border-radius: 12px; padding: 12px 14px; font-size: .95rem; }
        .ai-action-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ai-presets button { margin-bottom: 8px; }
        .ai-response-meta { font-size: .92rem; color: #6b7280; margin-bottom: 10px; }
        .ai-banner { border-radius: 18px; padding: 24px; margin-bottom: 18px; }
        .ai-section { border-radius: 18px; padding: 20px; margin-bottom: 16px; background: #ffffff; box-shadow: inset 0 0 0 1px rgba(15,23,42,.06); }
        .sticky-panel { position: sticky; top: 20px; }    </style>
    <link href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" rel="stylesheet" />
    <script src="https://unpkg.com/grapesjs"></script>
@endsection

@section('content')
    <div class="admin-topbar">
        <div>
            <h2>Agent 控制中心</h2>
            <p style="margin: 6px 0 0; color: #4b5563;">在这里可动态发布 Agent、调度工作流、切换模型、管理工具和 MCP，实时查看运行态统计。</p>
        </div>
        <div>
            <a href="{{ route('admin.dashboard') }}" class="button secondary small">返回后台</a>
        </div>
    </div>

    <div class="section-tabs">
        <button class="section-tab active" data-tab="overview">概览</button>
        <button class="section-tab" data-tab="agents">Agents</button>
        <button class="section-tab" data-tab="workflows">工作流</button>
        <button class="section-tab" data-tab="models">模型</button>
        <button class="section-tab" data-tab="tools">工具</button>
        <button class="section-tab" data-tab="business">业务工具</button>
            <button class="section-tab" data-tab="editor">AI 装修编辑器</button>
            <div class="panel-card"><h3>Agents</h3><p id="summary-agents">加载中…</p></div>
            <div class="panel-card"><h3>工作流</h3><p id="summary-workflows">加载中…</p></div>
            <div class="panel-card"><h3>模型</h3><p id="summary-models">加载中…</p></div>
            <div class="panel-card"><h3>工具</h3><p id="summary-tools">加载中…</p></div>
            <div class="panel-card"><h3>Prompt</h3><p id="summary-prompts">加载中…</p></div>
            <div class="panel-card"><h3>MCP</h3><p id="summary-mcps">加载中…</p></div>
        </div>

        <div class="panel-card" style="margin-top: 20px;">
            <h3>快速操作</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 12px;">
                <button class="button small" onclick="setTab('agents')">管理 Agents</button>
                <button class="button small" onclick="setTab('workflows')">可视化编辑工作流</button>
                <button class="button small" onclick="setTab('models')">切换模型</button>
                <button class="button small" onclick="setTab('analytics')">查看监控</button>
            </div>
        </div>
    </div>

    <div id="section-agents" class="tab-panel">
        <div class="section-header">
            <h2>Agents 管理</h2>
            <button class="button" onclick="openResourceModal('agents')">发布新 Agent</button>
        </div>
        <div id="agents-table" class="table-wrapper"></div>
    </div>

    <div id="section-workflows" class="tab-panel">
        <div class="section-header">
            <h2>工作流管理</h2>
            <button class="button" onclick="openResourceModal('workflows')">创建新工作流</button>
        </div>
        <div id="workflows-table" class="table-wrapper"></div>
        <div id="workflow-editor" class="panel-card" style="margin-top: 18px; display: none;">
            <div class="section-header">
                <div>
                    <h3 id="workflow-editor-title">工作流可视化编辑</h3>
                    <p id="workflow-editor-description" style="margin: 6px 0 0; color: #6b7280;">选择一个工作流后可直接在 JSON 中编辑 graph，实时预览节点关系。</p>
                </div>
                <button class="button secondary small" onclick="closeWorkflowEditor()">关闭</button>
            </div>
            <div style="margin-bottom: 18px;">
                <div class="workflow-canvas" id="workflow-graph-preview"></div>
            </div>
            <div style="margin-bottom: 12px;">
                <label for="graph-json-editor" style="font-weight: 600; margin-bottom: 6px; display: block;">graph JSON</label>
                <textarea id="graph-json-editor" class="json-editor"></textarea>
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="button" onclick="saveWorkflowGraph()">保存工作流图</button>
                <button class="button secondary" onclick="renderSelectedWorkflowGraph()">刷新预览</button>
            </div>
        </div>
    </div>

    <div id="section-models" class="tab-panel">
        <div class="section-header">
            <h2>模型管理</h2>
            <button class="button" onclick="openResourceModal('models')">新增模型</button>
        </div>
        <div id="models-table" class="table-wrapper"></div>
    </div>

    <div id="section-tools" class="tab-panel">
        <div class="section-header">
            <h2>工具管理</h2>
            <button class="button" onclick="openResourceModal('tools')">新增工具</button>
        </div>
        <div id="tools-table" class="table-wrapper"></div>
    </div>

    <div id="section-business" class="tab-panel">
        <div class="section-header">
            <h2>本地业务工具</h2>
            <button class="button" onclick="openResourceModal('tools')">查看已注册工具</button>
        </div>
        <div class="panel-card">
            <p>这里可以快速创建可由 AI 工作流调用的本地业务工具，并生成常用工作流模板。</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
                <button class="button small" onclick="openBusinessToolTemplate('product_update')">产品更新工具</button>
                <button class="button small" onclick="openBusinessToolTemplate('collection_manage')">集合管理工具</button>
                <button class="button small" onclick="openBusinessToolTemplate('discount_create')">创建折扣工具</button>
                <button class="button small" onclick="openBusinessToolTemplate('customer_segment')">客户细分工具</button>
                <button class="button small" onclick="openBusinessToolTemplate('order_lookup')">订单查询工具</button>
                <button class="button small" onclick="openBusinessToolTemplate('theme_adjust')">主题调整建议工具</button>
            </div>
            <div style="margin-top:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
                <button class="button" onclick="openBusinessWorkflowTemplate('product_management')">生成产品管理工作流</button>
                <button class="button" onclick="openBusinessWorkflowTemplate('discount_campaign')">生成折扣活动工作流</button>
            </div>
        </div>
    </div>

    <div id="section-editor" class="tab-panel">
        <div class="section-header">
            <h2>AI 装修编辑器</h2>
            <button class="button" onclick="fetchThemeOptions()">加载主题配置</button>
        </div>
        <div class="panel-card">
            <p>通过 AI 生成或校验店铺装修方案，预览后可直接应用到主题配置与页面模型。中心区域展示当前主题与 AI 方案的对比，右侧固定 AI 助手用于快速交互。</p>
            <div class="editor-shell">
                <aside class="editor-sidebar">
                    <div class="panel-card theme-editor-sidebar sticky-panel">
                        <h3>装修侧栏</h3>
                        <ul class="editor-menu">
                            <li class="editor-menu-item active" data-section="theme" onclick="setEditorSection('theme')"><span>主题配色</span><small>颜色 / 字体</small></li>
                            <li class="editor-menu-item" data-section="banner" onclick="setEditorSection('banner')"><span>Banner 横幅</span><small>视觉焦点</small></li>
                            <li class="editor-menu-item" data-section="homepage" onclick="setEditorSection('homepage')"><span>首页模块</span><small>板块布局</small></li>
                            <li class="editor-menu-item" data-section="products" onclick="setEditorSection('products')"><span>商品展示</span><small>推荐区 / 促销</small></li>
                            <li class="editor-menu-item" data-section="marketing" onclick="setEditorSection('marketing')"><span>营销模块</span><small>活动 / 卖点</small></li>
                            <li class="editor-menu-item" data-section="footer" onclick="setEditorSection('footer')"><span>页脚设置</span><small>信息 / 联系方式</small></li>
                        </ul>
                    </div>
                    <div class="panel-card theme-editor-sidebar sticky-panel">
                        <h3>模块库</h3>
                        <div class="module-card" onclick="fillPreset('首页大图Banner + CTA')">
                            <h4>首页大图 Banner</h4>
                            <p>用于展示促销、活动或品牌主视觉。</p>
                        </div>
                        <div class="module-card" onclick="fillPreset('推荐新品与热销商品模块')">
                            <h4>新品 / 热销区</h4>
                            <p>商品推荐模块，提升转化和爆款曝光。</p>
                        </div>
                        <div class="module-card" onclick="fillPreset('品牌故事与服务保障区')">
                            <h4>品牌故事</h4>
                            <p>展示品牌理念、服务和用户信任点。</p>
                        </div>
                        <div class="module-card" onclick="fillPreset('限时优惠倒计时模块')">
                            <h4>营销活动</h4>
                            <p>适合节日促销、限时折扣、拼团等活动。</p>
                        </div>
                    </div>
                </aside>
                <main class="editor-main">
                    <div class="panel-card">
                        <h3>当前主题 VS AI 方案</h3>
                        <div class="comparison-grid">
                            <div class="comparison-card">
                                <h4>当前主题</h4>
                                <p id="current-theme-summary">尚未加载主题配置，点击“加载主题配置”。</p>
                            </div>
                            <div class="comparison-card">
                                <h4>AI 方案</h4>
                                <p id="ai-theme-summary">尚未生成方案，AI 生成后显示差异摘要。</p>
                            </div>
                        </div>
                        <div class="editor-diff" id="theme-diff-panel">
                            <h4>差异摘要</h4>
                            <ul id="theme-diff-list"><li>请加载主题配置并生成 AI 方案以查看对比。</li></ul>
                        </div>
                    </div>
                    <div class="panel-card section-detail-panels">
                        <div class="section-detail-panel active" data-section="theme">
                            <h4>主题配色与风格</h4>
                            <p>定义店铺主色、辅助色、按钮、文字与品牌视觉方向。</p>
                            <ul>
                                <li>确认主色与辅色方案</li>
                                <li>让 AI 输出字体、按钮与 CTA 风格</li>
                                <li>适配不同页面的统一视觉基调</li>
                            </ul>
                        </div>
                        <div class="section-detail-panel" data-section="banner">
                            <h4>Banner 横幅与头图</h4>
                            <p>设定顶部视觉焦点与活动宣传区域。</p>
                            <ul>
                                <li>生成主视觉Banner文案与背景风格</li>
                                <li>优先突出活动主题、促销和新品</li>
                                <li>给出图片、按钮与视觉节奏建议</li>
                            </ul>
                        </div>
                        <div class="section-detail-panel" data-section="homepage">
                            <h4>首页模块布局</h4>
                            <p>搭建首页模块排列，提升浏览和转化路径。</p>
                            <ul>
                                <li>调整首页推荐、专题、热销区排列</li>
                                <li>规划用户阅览顺序与视觉留白</li>
                                <li>结合活动与新品场景优化结构</li>
                            </ul>
                        </div>
                        <div class="section-detail-panel" data-section="products">
                            <h4>商品展示与推荐</h4>
                            <p>优化商品卡片、推荐区与促销展示。</p>
                            <ul>
                                <li>配置热销、精选、新品和折扣展示</li>
                                <li>推荐商品卡片样式与布局</li>
                                <li>明确促销标签和转化入口</li>
                            </ul>
                        </div>
                        <div class="section-detail-panel" data-section="marketing">
                            <h4>营销活动与引导</h4>
                            <p>设计专题活动区、优惠信息与用户决策点。</p>
                            <ul>
                                <li>构建限时活动促销区域</li>
                                <li>设置信任卖点、服务保障和会员权益</li>
                                <li>建议 CTA 文案与优惠触发位置</li>
                            </ul>
                        </div>
                        <div class="section-detail-panel" data-section="footer">
                            <h4>页脚与信息区</h4>
                            <p>整理联系方式、服务承诺与品牌补充信息。</p>
                            <ul>
                                <li>配置店铺服务、客服和物流说明</li>
                                <li>展示社交链接和品牌认证</li>
                                <li>保证页脚信息层级清晰、易读</li>
                            </ul>
                        </div>
                    </div>
                    <div class="theme-editor-canvas" id="gjs"></div>
                    <div class="panel-card editor-diff">
                        <h4>预览与改造建议</h4>
                        <div id="ai-suggestion-summary">AI 方案会在此处展示核心改造建议与布局更新。</div>
                    </div>
                </main>
                <aside class="editor-assistant">
                    <div class="panel-card sticky-panel">
                        <h3>AI 装修助手</h3>
                        <div class="ai-response-meta">输入自然语言指令，AI 将生成主题、Banner、模块和首页布局建议。</div>
                        <div>
                            <label for="editor-style">装修风格</label>
                            <input id="editor-style" class="ai-command-input" type="text" placeholder="例如: 现代简约、科技风、轻奢风" />
                        </div>
                        <div>
                            <label for="editor-page">目标页面</label>
                            <input id="editor-page" class="ai-command-input" type="text" placeholder="例如: 首页、商品页、专题页" />
                        </div>
                        <div>
                            <label for="editor-audience">目标人群</label>
                            <input id="editor-audience" class="ai-command-input" type="text" placeholder="例如: 年轻女性、数码用户" />
                        </div>
                        <div>
                            <label for="editor-focus">设计重点</label>
                            <input id="editor-focus" class="ai-command-input" type="text" placeholder="例如: 新品、促销、品牌形象" />
                        </div>
                        <div>
                            <label for="editor-message" style="font-weight: 600; display:block; margin-bottom:6px;">装修指令</label>
                            <textarea id="editor-message" class="ai-command-input" style="min-height: 160px; resize:vertical;">请帮我生成一份适合当前店铺的首页装修方案，包含主题色、字体、Banner 布局、推荐模块和板块顺序。</textarea>
                        </div>
                        <div class="ai-action-row">
                            <button class="button" onclick="previewDesign()">AI 生成方案</button>
                            <button class="button secondary" onclick="applyDesign()">应用到主题</button>
                        </div>
                        <div class="ai-presets" style="margin-top: 14px;">
                            <h4>快捷指令</h4>
                            <button class="button secondary small" onclick="fillPreset('把首页改成简洁科技风')">简洁科技风</button>
                            <button class="button secondary small" onclick="fillPreset('把门头横幅换成夏季促销风')">夏季促销</button>
                            <button class="button secondary small" onclick="fillPreset('首页增加新品推荐区和热销区')">增加新品/热销区</button>
                            <button class="button secondary small" onclick="fillPreset('适合潮玩店')">适合潮玩店</button>
                            <button class="button secondary small" onclick="fillPreset('适合母婴店')">适合母婴店</button>
                            <button class="button secondary small" onclick="fillPreset('适合 618 活动')">适合 618 活动</button>
                        </div>
                    </div>
                    <div class="panel-card" style="max-height: 520px; overflow:auto;">
                        <h3>AI 预览 / 结果</h3>
                        <div id="editor-response-json" class="json-editor" style="min-height: 360px; background: #111827; color: #f9fafb;"></div>
                    </div>
                </aside>
            </div>
        </div>
    </div>

    <div id="section-prompts" class="tab-panel">
        <div class="section-header">
            <h2>Prompt 管理</h2>
            <button class="button" onclick="openResourceModal('prompts')">新增 Prompt</button>
        </div>
        <div id="prompts-table" class="table-wrapper"></div>
    </div>

    <div id="section-mcps" class="tab-panel">
        <div class="section-header">
            <h2>MCP 管理</h2>
            <button class="button" onclick="openResourceModal('mcps')">新增 MCP</button>
        </div>
        <div id="mcps-table" class="table-wrapper"></div>
    </div>

    <div id="section-analytics" class="tab-panel">
        <div class="section-header">
            <h2>分析与监控</h2>
            <button class="button" onclick="loadAnalytics()">刷新统计</button>
        </div>
        <div id="analytics-output"></div>
    </div>

    <div id="resource-modal" class="modal-backdrop">
        <div class="modal-card">
            <button class="modal-close" onclick="closeResourceModal()">×</button>
            <h3 id="modal-title">资源编辑</h3>
            <p id="modal-intro" style="margin: 0 0 16px; color: #4b5563;"></p>
            <div id="modal-body"></div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; margin-top: 18px;">
                <button class="button" id="modal-submit" onclick="submitResourceForm()">保存</button>
                <button class="button secondary" onclick="closeResourceModal()">取消</button>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script>
        const apiBase = '{{ url('api/admin/agent-control') }}';
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': window.csrfToken,
        };

        const state = {
            activeTab: 'overview',
            agents: [],
            workflows: [],
            models: [],
            tools: [],
            prompts: [],
            mcps: [],
            analytics: {},
            selectedWorkflow: null,
            currentModal: null,
        };

        const resourceTemplates = {
            agents: {
                namespace: 'agent.example',
                name: '示例 Agent',
                description: '企业级智能操作 Agent',
                icon: 'robot',
                enabled: true,
                model_id: null,
                system_prompt_id: null,
                max_tokens: 512,
                temperature: 0.7,
                top_p: 1,
                timeout_seconds: 30,
                min_role: 'admin',
                is_public: false,
                tags: [],
                metadata: {},
                version: 1,
            },
            workflows: {
                namespace: 'workflow.example',
                name: '示例工作流',
                description: '从输入到模型再到工具的执行路径',
                icon: 'flow',
                graph: {
                    nodes: [
                        {id: 'start', label: '输入触发', type: 'trigger'},
                        {id: 'ai', label: '调用模型', type: 'task'},
                    ],
                    edges: [
                        {from: 'start', to: 'ai'},
                    ],
                },
                enabled: true,
                execution_mode: 'sequential',
                retry_strategy: { max_attempts: 3, backoff: 'linear' },
                timeout_seconds: 120,
                metadata: {},
                version: 1,
            },
            models: {
                namespace: 'model.example',
                name: '示例模型',
                provider: 'openai',
                model_name: 'gpt-4o',
                api_endpoint: '',
                api_key: '',
                api_key_backup: '',
                max_tokens: 1024,
                context_window: 4096,
                supports_function_calling: false,
                supports_vision: false,
                supports_json_mode: false,
                input_cost_per_1k: 0,
                output_cost_per_1k: 0,
                avg_latency_ms: 0,
                availability_percentage: 100,
                enabled: true,
                rate_limit_per_minute: 0,
                monthly_quota_budget: 0,
                priority: 100,
                fallback_model_id: null,
                tags: [],
                metadata: {},
                version: 1,
            },
            tools: {
                namespace: 'tool.example',
                name: '示例工具',
                description: '企业级外部能力插件',
                type: 'external',
                handler_class: 'App\\Tools\\ExampleTool',
                icon: 'tool',
                documentation: 'https://example.com/docs',
                config: {},
                required_params: [],
                enabled: true,
                tags: [],
                rate_limit: 0,
                cost_per_call: 0,
                metadata: {},
                version: 1,
            },
            prompts: {
                namespace: 'prompt.example',
                name: '示例 Prompt',
                description: '通用应答模板',
                content: '请以友好语气回答用户问题。',
                variables: {},
                version: 1,
                status: 'draft',
                enabled: true,
                tags: [],
                metadata: {},
            },
            mcps: {
                namespace: 'mcp.example',
                name: '示例知识库',
                description: '知识库调用 MCP 接口',
                server_url: 'https://example.com/mcp',
                server_type: 'qdrant',
                auth_token: '',
                knowledge_base_id: '',
                embedding_model: 'text-embedding-3-small',
                chunk_size: 500,
                overlap: 50,
                search_method: 'similarity',
                top_k: 5,
                similarity_threshold: 0.78,
                enabled: true,
                tags: [],
                metadata: {},
            },
        };

        const businessToolTemplates = {
            product_update: {
                namespace: 'business.product_update',
                name: '本地产品更新',
                description: '更新本地商品信息并同步业务系统状态。',
                type: 'external',
                handler_class: 'App\\AgentTools\\LocalBusinessTool',
                icon: 'package',
                documentation: '',
                config: {
                    action: 'update_product',
                },
                required_params: ['product_id', 'input'],
                enabled: true,
                tags: ['business', 'product'],
                rate_limit: 10,
                cost_per_call: 0,
                metadata: {},
                version: 1,
            },
            collection_manage: {
                namespace: 'business.collection_manage',
                name: '本地集合管理',
                description: '创建或更新本地商品集合。',
                type: 'external',
                handler_class: 'App\\AgentTools\\LocalBusinessTool',
                icon: 'grid',
                documentation: '',
                config: {
                    action: 'update_collection',
                },
                required_params: ['collection_id', 'input'],
                enabled: true,
                tags: ['business', 'collection'],
                rate_limit: 10,
                cost_per_call: 0,
                metadata: {},
                version: 1,
            },
            discount_create: {
                namespace: 'business.discount_create',
                name: '本地折扣创建',
                description: '创建本地折扣码或促销活动。',
                type: 'external',
                handler_class: 'App\\AgentTools\\LocalBusinessTool',
                icon: 'tag',
                documentation: '',
                config: {
                    action: 'create_discount',
                },
                required_params: ['input'],
                enabled: true,
                tags: ['business', 'discount'],
                rate_limit: 5,
                cost_per_call: 0,
                metadata: {},
                version: 1,
            },
            customer_segment: {
                namespace: 'business.customer_segment',
                name: '客户细分',
                description: '生成本地客户细分并返回营销名单。',
                type: 'external',
                handler_class: 'App\\AgentTools\\LocalBusinessTool',
                icon: 'users',
                documentation: '',
                config: {
                    action: 'segment_customers',
                },
                required_params: ['criteria'],
                enabled: true,
                tags: ['business', 'customer'],
                rate_limit: 5,
                cost_per_call: 0,
                metadata: {},
                version: 1,
            },
            order_lookup: {
                namespace: 'business.order_lookup',
                name: '订单查询',
                description: '查询本地订单详情。',
                type: 'external',
                handler_class: 'App\\AgentTools\\LocalBusinessTool',
                icon: 'shopping-cart',
                documentation: '',
                config: {
                    action: 'get_order',
                },
                required_params: ['order_id'],
                enabled: true,
                tags: ['business', 'order'],
                rate_limit: 10,
                cost_per_call: 0,
                metadata: {},
                version: 1,
            },
            theme_adjust: {
                namespace: 'business.theme_adjust',
                name: '主题调整建议',
                description: '生成本地主题或页面展示调整建议。',
                type: 'external',
                handler_class: 'App\\AgentTools\\LocalBusinessTool',
                icon: 'paint-brush',
                documentation: '',
                config: {
                    action: 'adjust_theme',
                },
                required_params: ['theme_id', 'settings'],
                enabled: true,
                tags: ['business', 'theme'],
                rate_limit: 5,
                cost_per_call: 0,
                metadata: {},
                version: 1,
            },
            theme_design: {
                namespace: 'business.theme_design',
                name: '店铺装修设计',
                description: '生成首页、Banner、模块布局与主题配色的装修方案。',
                type: 'external',
                handler_class: 'App\\AgentTools\\LocalBusinessTool',
                icon: 'layout',
                documentation: '',
                config: {
                    action: 'theme_design_suggestion',
                },
                required_params: ['style', 'page', 'audience', 'focus'],
                enabled: true,
                tags: ['business', 'theme'],
                rate_limit: 5,
                cost_per_call: 0,
                metadata: {},
                version: 1,
            },
        };

        const businessWorkflowTemplates = {
            product_management: {
                namespace: 'business.product_management',
                name: '本地产品管理工作流',
                description: '根据自然语言指令管理本地产品信息。',
                icon: 'sparkles',
                enabled: true,
                execution_mode: 'sequential',
                retry_strategy: { max_attempts: 2, backoff: 'exponential' },
                timeout_seconds: 120,
                graph: {
                    nodes: [
                        { id: 'start', label: '收到指令', type: 'trigger' },
                        { id: 'ai', label: '解析更新内容', type: 'task' },
                        { id: 'tool', label: '执行产品更新', type: 'tool', tool_namespace: 'business.product_update' },
                    ],
                    edges: [
                        { from: 'start', to: 'ai' },
                        { from: 'ai', to: 'tool' },
                    ],
                },
                metadata: {},
                version: 1,
            },
            discount_campaign: {
                namespace: 'business.discount_campaign',
                name: '本地折扣活动工作流',
                description: '自动生成折扣活动并下发到本地系统。',
                icon: 'discount',
                enabled: true,
                execution_mode: 'sequential',
                retry_strategy: { max_attempts: 2, backoff: 'linear' },
                timeout_seconds: 120,
                graph: {
                    nodes: [
                        { id: 'start', label: '活动需求', type: 'trigger' },
                        { id: 'ai', label: '生成折扣参数', type: 'task' },
                        { id: 'tool', label: '创建折扣', type: 'tool', tool_namespace: 'business.discount_create' },
                    ],
                    edges: [
                        { from: 'start', to: 'ai' },
                        { from: 'ai', to: 'tool' },
                    ],
                },
                metadata: {},
                version: 1,
            },
            theme_renovation: {
                namespace: 'business.theme_renovation',
                name: '店铺装修设计工作流',
                description: '从自然语言需求生成装修方案并应用到主题配置。',
                icon: 'layout',
                enabled: true,
                execution_mode: 'sequential',
                retry_strategy: { max_attempts: 2, backoff: 'linear' },
                timeout_seconds: 180,
                graph: {
                    nodes: [
                        { id: 'start', label: '装修需求', type: 'trigger' },
                        { id: 'ai', label: '生成装修方案', type: 'task' },
                        { id: 'tool', label: '设计方案', type: 'tool', tool_namespace: 'business.theme_design' },
                    ],
                    edges: [
                        { from: 'start', to: 'ai' },
                        { from: 'ai', to: 'tool' },
                    ],
                },
                metadata: {},
                version: 1,
            },
        };

        function openBusinessToolTemplate(name) {
            const payload = businessToolTemplates[name];
            if (!payload) {
                showNotification('未找到对应业务工具模板。');
                return;
            }
            openResourceModal('tools', null, payload);
        }

        function openBusinessWorkflowTemplate(name) {
            const payload = businessWorkflowTemplates[name];
            if (!payload) {
                showNotification('未找到对应业务工作流模板。');
                return;
            }
            setTab('workflows');
            openResourceModal('workflows', null, payload);
        }

        function setTab(tab) {
            state.activeTab = tab;
            document.querySelectorAll('.section-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === 'section-' + tab));

            const loadableResources = ['agents', 'workflows', 'models', 'tools', 'prompts', 'mcps'];
            if (loadableResources.includes(tab)) {
                loadResource(tab);
            }
            if (tab === 'editor') {
                loadEditorDefaults();
            }
            if (tab === 'analytics') {
                loadAnalytics();
            }
        }

        function showNotification(message) {
            const target = document.createElement('div');
            target.className = 'notification';
            target.textContent = message;
            document.querySelector('#section-' + state.activeTab).prepend(target);
            setTimeout(() => target.remove(), 4200);
        }

        async function loadAllCounts() {
            const keys = ['agents', 'workflows', 'models', 'tools', 'prompts', 'mcps'];
            await Promise.all(keys.map(async (resource) => {
                const data = await fetchResourceList(resource);
                const count = Array.isArray(data) ? data.length : data.length || 0;
                document.querySelector('#summary-' + resource).textContent = `${count} 条`; 
            }));
        }

        async function fetchResourceList(resource) {
            try {
                const response = await fetch(`${apiBase}/${resource}?per_page=100`, { credentials: 'same-origin' });
                if (!response.ok) {
                    throw new Error('无法读取 ' + resource);
                }
                const json = await response.json();
                return json.data || json;
            } catch (error) {
                console.error(error);
                return [];
            }
        }

        async function loadResource(resource) {
            if (state[resource]?.length > 0) {
                renderResourceTable(resource, state[resource]);
                return;
            }

            const data = await fetchResourceList(resource);
            state[resource] = data;
            renderResourceTable(resource, data);
        }

        function formatEnabled(enabled) {
            return `<span class="badge ${enabled ? 'enabled' : 'disabled'}">${enabled ? '已启用' : '已禁用'}</span>`;
        }

        function renderResourceTable(resource, items) {
            const container = document.querySelector('#' + resource + '-table');
            if (!container) return;

            if (!items || items.length === 0) {
                container.innerHTML = '<div class="panel-card">暂无数据，点击右上角“新增”创建。</div>';
                return;
            }

            const rows = items.map(item => {
                let details = [];
                switch (resource) {
                    case 'agents':
                        details = [`${item.name} (${item.namespace})`, item.description || '', item.model_id ? '模型:'+ item.model_id : '未绑定', formatEnabled(item.enabled)];
                        break;
                    case 'workflows':
                        details = [`${item.name} (${item.namespace})`, `执行: ${item.execution_mode || '未设置'}`, `节点: ${item.graph?.nodes?.length || 0}`, formatEnabled(item.enabled)];
                        break;
                    case 'models':
                        details = [`${item.name} (${item.namespace})`, `提供商: ${item.provider || 'unknown'}`, item.model_name || '', formatEnabled(item.enabled)];
                        break;
                    case 'tools':
                        details = [`${item.name} (${item.namespace})`, `类型: ${item.type || 'unknown'}`, item.handler_class || '未配置', formatEnabled(item.enabled)];
                        break;
                    case 'prompts':
                        details = [`${item.name} (${item.namespace})`, `状态: ${item.status || 'unknown'}`, `内容长度: ${item.content?.length || 0}`, formatEnabled(item.enabled)];
                        break;
                    case 'mcps':
                        details = [`${item.name} (${item.namespace})`, `服务: ${item.server_type || 'unknown'}`, item.server_url || '', formatEnabled(item.enabled)];
                        break;
                }
                const actionButtons = [];
                actionButtons.push(`<button class="button small secondary" onclick="editResource('${resource}', ${item.id})">编辑</button>`);
                actionButtons.push(`<button class="button small" onclick="toggleResource('${resource}', ${item.id})">切换</button>`);
                if (resource === 'workflows') {
                    actionButtons.push(`<button class="button small" onclick="openWorkflowEditor(${item.id})">可视化</button>`);
                }
                actionButtons.push(`<button class="button small danger" onclick="deleteResource('${resource}', ${item.id})">删除</button>`);

                return `
                    <tr>
                        <td>${details.join('<br>')}</td>
                        <td style="white-space: nowrap;">${actionButtons.join(' ')}</td>
                    </tr>
                `;
            }).join('');

            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>主要信息</th>
                            <th style="width: 280px;">操作</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        }

        function openResourceModal(resource, item = null, customPayload = null) {
            state.currentModal = { resource, item };
            document.querySelector('#resource-modal').classList.add('active');
            document.querySelector('#modal-title').textContent = item ? `编辑 ${resource.slice(0, -1)}` : `创建 ${resource.slice(0, -1)}`;
            document.querySelector('#modal-intro').textContent = '请编辑 JSON 内容，保存后将提交到后台 API。';
            const body = document.querySelector('#modal-body');
            const payload = item ? deepClone(item) : deepClone(customPayload || resourceTemplates[resource] || {});
            if (!payload) {
                body.innerHTML = '<p>无法创建该资源。</p>';
                return;
            }
            body.innerHTML = `
                <label for="resource-json-editor" style="font-weight: 600; display: block; margin-bottom: 8px;">${item ? '资源 JSON' : '资源 JSON 模板'}</label>
                <textarea id="resource-json-editor" class="json-editor">${escapeHtml(JSON.stringify(payload, null, 2))}</textarea>
            `;
        }

        function closeResourceModal() {
            state.currentModal = null;
            document.querySelector('#resource-modal').classList.remove('active');
        }

        async function submitResourceForm() {
            const modal = state.currentModal;
            if (!modal) {
                return;
            }
            const editor = document.querySelector('#resource-json-editor');
            let payload;
            try {
                payload = JSON.parse(editor.value);
            } catch (error) {
                alert('JSON 格式不正确，请修正后再提交。');
                return;
            }

            const url = modal.item ? `${apiBase}/${modal.resource}/${modal.item.id}` : `${apiBase}/${modal.resource}`;
            const method = modal.item ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: defaultHeaders,
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            if (! response.ok) {
                const error = await response.json().catch(() => null);
                alert('保存失败：' + (error?.message || response.statusText));
                return;
            }

            closeResourceModal();
            showNotification('保存成功，已刷新列表。');
            state[modal.resource] = [];
            await loadResource(modal.resource);
            await loadAllCounts();
        }

        async function toggleResource(resource, id) {
            const response = await fetch(`${apiBase}/${resource}/${id}/toggle`, {
                method: 'PATCH',
                headers: defaultHeaders,
                credentials: 'same-origin',
            });
            if (! response.ok) {
                showNotification('切换失败');
                return;
            }
            state[resource] = [];
            await loadResource(resource);
            showNotification('状态已更新');
        }

        async function deleteResource(resource, id) {
            if (!confirm('确认删除这条记录？')) {
                return;
            }
            const response = await fetch(`${apiBase}/${resource}/${id}`, {
                method: 'DELETE',
                headers: defaultHeaders,
                credentials: 'same-origin',
            });
            if (! response.ok) {
                showNotification('删除失败');
                return;
            }
            state[resource] = [];
            await loadResource(resource);
            await loadAllCounts();
            showNotification('已删除');
        }

        function editResource(resource, id) {
            const item = (state[resource] || []).find(v => Number(v.id) === Number(id));
            if (!item) {
                alert('未找到资源');
                return;
            }
            openResourceModal(resource, item);
        }

        async function openWorkflowEditor(id) {
            const workflow = (state.workflows || []).find(v => Number(v.id) === Number(id));
            if (!workflow) {
                return;
            }
            state.selectedWorkflow = workflow;
            const editor = document.querySelector('#workflow-editor');
            const graphEditor = document.querySelector('#graph-json-editor');
            editor.style.display = 'block';
            document.querySelector('#workflow-editor-title').textContent = `工作流：${workflow.name}`;
            graphEditor.value = JSON.stringify(workflow.graph || { nodes: [], edges: [] }, null, 2);
            renderSelectedWorkflowGraph();
            scrollToElement(editor);
        }

        function closeWorkflowEditor() {
            state.selectedWorkflow = null;
            document.querySelector('#workflow-editor').style.display = 'none';
        }

        async function saveWorkflowGraph() {
            if (!state.selectedWorkflow) {
                return;
            }
            const graphEditor = document.querySelector('#graph-json-editor');
            let graph;
            try {
                graph = JSON.parse(graphEditor.value);
            } catch (error) {
                alert('graph JSON 格式不正确');
                return;
            }
            const payload = deepClone(state.selectedWorkflow);
            payload.graph = graph;

            const response = await fetch(`${apiBase}/workflows/${state.selectedWorkflow.id}`, {
                method: 'PUT',
                headers: defaultHeaders,
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });
            if (! response.ok) {
                const error = await response.json().catch(() => null);
                alert('保存失败：' + (error?.message || response.statusText));
                return;
            }
            state.workflows = [];
            await loadResource('workflows');
            showNotification('工作流 graph 已保存');
        }

        function renderSelectedWorkflowGraph() {
            const preview = document.querySelector('#workflow-graph-preview');
            const graphEditor = document.querySelector('#graph-json-editor');
            let graph;
            try {
                graph = JSON.parse(graphEditor.value);
            } catch (error) {
                preview.innerHTML = '<div style="padding: 14px; color: #b91c1c;">graph JSON 无法解析。</div>';
                return;
            }
            renderWorkflowGraph(graph);
        }

        function renderWorkflowGraph(graph) {
            const preview = document.querySelector('#workflow-graph-preview');
            preview.innerHTML = '';

            if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
                preview.innerHTML = '<div style="padding: 18px; color: #6b7280;">请先填充 graph.nodes 和 graph.edges。</div>';
                return;
            }

            const layout = {}; 
            const columns = Math.ceil(Math.sqrt(graph.nodes.length || 1));
            graph.nodes.forEach((node, index) => {
                const x = 26 + (index % columns) * 220;
                const y = 26 + Math.floor(index / columns) * 140;
                layout[node.id] = { x, y, label: node.label || node.id, type: node.type || 'task' };
            });

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.position = 'absolute';
            svg.style.inset = '0';
            preview.appendChild(svg);

            graph.edges.forEach(edge => {
                const from = layout[edge.from];
                const to = layout[edge.to];
                if (!from || !to) {
                    return;
                }
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const startX = from.x + 150;
                const startY = from.y + 28;
                const endX = to.x + 8;
                const endY = to.y + 28;
                const midX = startX + Math.max(20, (endX - startX) / 2);
                const d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                line.setAttribute('d', d);
                line.setAttribute('stroke', '#2563eb');
                line.setAttribute('fill', 'none');
                line.setAttribute('stroke-width', '3');
                svg.appendChild(line);

                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                marker.setAttribute('d', 'M 0 0 L 8 4 L 0 8 Z');
                marker.setAttribute('fill', '#2563eb');
                marker.setAttribute('transform', `translate(${endX - 4}, ${endY - 4})`);
                svg.appendChild(marker);
            });

            graph.nodes.forEach(node => {
                const meta = layout[node.id];
                if (!meta) return;
                const item = document.createElement('div');
                item.className = 'workflow-node';
                item.style.left = meta.x + 'px';
                item.style.top = meta.y + 'px';
                item.innerHTML = `<strong>${escapeHtml(meta.label)}</strong><div style="margin-top: 6px; font-size: .86rem; color: #d1d5db;">${escapeHtml(meta.type)}</div>`;
                preview.appendChild(item);
            });
        }

        async function loadAnalytics() {
            const output = document.querySelector('#analytics-output');
            output.innerHTML = '<div class="panel-card">加载中…</div>';
            const endpoints = [
                { name: 'agent-usage', label: 'Agent 使用统计' },
                { name: 'cost-breakdown', label: '成本拆分' },
                { name: 'performance', label: '性能数据' },
            ];
            let html = '';
            for (const item of endpoints) {
                const response = await fetch(`${apiBase}/analytics/${item.name}`, { credentials: 'same-origin' });
                if (!response.ok) {
                    html += `<div class="panel-card"><h3>${item.label}</h3><p>读取失败：${response.statusText}</p></div>`;
                    continue;
                }
                const json = await response.json();
                html += `<div class="panel-card"><h3>${item.label}</h3><pre style="white-space: pre-wrap; word-break: break-word;">${escapeHtml(JSON.stringify(json.data || json, null, 2))}</pre></div>`;
            }
            output.innerHTML = html;
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        let grapesEditor = null;
        let lastDesignPayload = null;
        let currentTheme = null;
        let activeEditorSection = 'theme';

        function setEditorSection(section) {
            activeEditorSection = section;
            document.querySelectorAll('.editor-menu-item').forEach(item => {
                item.classList.toggle('active', item.dataset.section === section);
            });
            document.querySelectorAll('.section-detail-panel').forEach(panel => {
                panel.classList.toggle('active', panel.dataset.section === section);
            });
            const mapping = {
                theme: { title: '主题配色与风格', placeholder: '请描述主视觉色、品牌调性和按钮样式。' },
                banner: { title: 'Banner 与头图', placeholder: '请让 AI 生成顶部横幅文案、主图风格和 CTA 引导。' },
                homepage: { title: '首页模块布局', placeholder: '请让 AI 规划首页推荐区、专题区和内容顺序。' },
                products: { title: '商品展示', placeholder: '请让 AI 生成商品推荐、热销区和促销展示方案。' },
                marketing: { title: '营销模块', placeholder: '请让 AI 设计活动区、促销信息和用户引导。' },
                footer: { title: '页脚设置', placeholder: '请让 AI 优化页脚信息、联系方式和品牌补充说明。' },
            };
            const info = mapping[section] || { title: '装修配置', placeholder: '请输入装修目标和希望优化的内容。'};
            document.getElementById('ai-suggestion-summary').textContent = `当前正在调整：${info.title}。AI 生成方案后，会同步建议该模块优化方向。`;
            const messageInput = document.getElementById('editor-message');
            if (messageInput) {
                messageInput.placeholder = info.placeholder;
            }
        }

        function renderThemeComparison() {
            const currentSummary = document.getElementById('current-theme-summary');
            const aiSummary = document.getElementById('ai-theme-summary');
            const diffList = document.getElementById('theme-diff-list');
            const suggestion = document.getElementById('ai-suggestion-summary');

            if (!currentTheme) {
                currentSummary.textContent = '尚未加载主题配置，点击“加载主题配置”。';
            } else {
                currentSummary.innerHTML = `主题色: <strong>${escapeHtml(currentTheme.primary_color || currentTheme.theme_color || '未配置')}</strong><br>首页模块: <strong>${Array.isArray(currentTheme.homepage_sections) ? currentTheme.homepage_sections.length : 0} 个</strong>`;
            }

            if (!lastDesignPayload) {
                aiSummary.textContent = '尚未生成方案，AI 生成后显示差异摘要。';
                diffList.innerHTML = '<li>请加载主题配置并生成 AI 方案以查看对比。</li>';
                return;
            }

            const aiTheme = lastDesignPayload.theme_options || lastDesignPayload.theme || {};
            const aiSectionCount = Array.isArray(lastDesignPayload.sections)
                ? lastDesignPayload.sections.length
                : Array.isArray(lastDesignPayload.layout?.sections)
                    ? lastDesignPayload.layout.sections.length
                    : 0;

            aiSummary.innerHTML = `主题色: <strong>${escapeHtml(aiTheme.primary_color || aiTheme.theme_color || 'AI 未返回')}</strong><br>首页模块: <strong>${aiSectionCount} 个</strong>`;

            const diffs = [];
            if (currentTheme?.primary_color && aiTheme.primary_color && currentTheme.primary_color !== aiTheme.primary_color) {
                diffs.push(`主题主色从 "${escapeHtml(currentTheme.primary_color)}" 调整为 "${escapeHtml(aiTheme.primary_color)}"。`);
            }
            if (currentTheme?.homepage_layout?.sections && lastDesignPayload?.layout?.sections && JSON.stringify(currentTheme.homepage_layout.sections) !== JSON.stringify(lastDesignPayload.layout.sections)) {
                diffs.push(`首页模块结构已更新，建议采用 ${aiSectionCount} 个区块。`);
            }
            if (Array.isArray(currentTheme?.homepage_sections) && Array.isArray(lastDesignPayload?.sections) && JSON.stringify(currentTheme.homepage_sections) !== JSON.stringify(lastDesignPayload.sections)) {
                diffs.push(`模块内容存在变化，AI 方案包含 ${aiSectionCount} 个推荐板块。`);
            }
            if (diffs.length === 0) {
                diffs.push('当前主题与 AI 方案差异较小，可按实际需求细化。');
            }

            diffList.innerHTML = diffs.map(diff => `<li>${diff}</li>`).join('');
            suggestion.textContent = lastDesignPayload.summary
                || lastDesignPayload.theme_options?.description
                || `AI 方案已生成，建议重点优化 ${escapeHtml(activeEditorSection === 'theme' ? '主题配色' : activeEditorSection === 'banner' ? 'Banner' : activeEditorSection === 'marketing' ? '营销活动' : activeEditorSection)}。`;
        }

        async function loadEditorDefaults() {
            initializeGrapesEditor();
            document.querySelector('#editor-response-json').textContent = '';
            await loadCurrentThemeLayout();
        }

        async function loadCurrentThemeLayout() {
            const response = await fetch(`${apiBase}/ai-editor/theme-options`, { credentials: 'same-origin' });
            if (!response.ok) {
                return;
            }
            const json = await response.json();
            if (json.success && json.theme_options) {
                currentTheme = json.theme_options;
                const design = {
                    theme_options: currentTheme,
                    layout: currentTheme.homepage_layout || null,
                    sections: currentTheme.homepage_sections || [],
                };
                renderDesignInEditor(design, true);
                renderThemeComparison();
            }
        }

        function initializeGrapesEditor() {
            if (grapesEditor) {
                return;
            }

            grapesEditor = grapesjs.init({
                container: '#gjs',
                fromElement: false,
                height: '720px',
                storageManager: false,
                blockManager: {
                    appendTo: '#gjs-blocks',
                    blocks: [
                        {
                            id: 'hero-banner',
                            label: 'Banner 区块',
                            content: '<section class="hero-banner"><h1>Banner 标题</h1><p>这里是顶部横幅内容</p></section>',
                        },
                        {
                            id: 'feature-grid',
                            label: '特色模块',
                            content: '<section class="feature-grid"><div>模块 A</div><div>模块 B</div><div>模块 C</div></section>',
                        },
                        {
                            id: 'product-list',
                            label: '商品列表',
                            content: '<section class="product-list"><h2>热销商品</h2></section>',
                        },
                        {
                            id: 'cta',
                            label: '促销 CTA',
                            content: '<section class="cta"><button>立即购买</button></section>',
                        },
                    ],
                },
                canvas: {
                    styles: [
                        'body { margin: 0; font-family: Arial, sans-serif; }',
                        '.hero-banner { padding: 32px; background: #f3f4f6; text-align: center; }',
                        '.feature-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:16px; padding:24px; }',
                        '.product-list { padding:24px; background:#ffffff; }',
                        '.cta { padding:24px; text-align:center; background:#111827; color:#fff; }',
                    ],
                },
                selectorManager: { componentFirst: true },
                styleManager: {
                    sectors: [
                        { name: '尺寸', open: false, buildProps: ['width', 'height', 'min-width', 'min-height'] },
                        { name: '布局', open: false, buildProps: ['display', 'position', 'top', 'left', 'right', 'bottom'] },
                        { name: '文字', open: false, buildProps: ['font-size', 'font-weight', 'color', 'text-align'] },
                    ],
                },
            });
        }

        function fillPreset(text) {
            document.querySelector('#editor-message').value = text;
            previewDesign();
        }

        function renderDesignInEditor(design, isCurrentTheme = false) {
            initializeGrapesEditor();
            const bannerHtml = buildBannerHtml(design.theme_options || design.theme || {});
            const layoutHtml = design.layout_html ? design.layout_html : buildLayoutHtml(design);
            const html = bannerHtml + layoutHtml;

            grapesEditor.setComponents(html || '<section><p>请点击“AI 生成方案”以加载设计内容。</p></section>');

            const meta = {
                theme: design.theme || design.theme_options || null,
                sections: design.sections || [],
                layout: design.layout || null,
                isCurrentTheme,
            };
            document.querySelector('#editor-response-json').textContent = JSON.stringify({ design, meta }, null, 2);
            lastDesignPayload = design;
        }

        function buildBannerHtml(themeOptions) {
            if (!themeOptions.homepage_banner) {
                return '';
            }

            const banner = themeOptions.homepage_banner;
            const title = banner.title ? `<h1>${banner.title}</h1>` : '';
            const subtitle = banner.subtitle ? `<p>${banner.subtitle}</p>` : '';
            const image = banner.image ? `<div class="ai-banner-image"><img src="${banner.image}" alt="Banner" style="max-width:100%;border-radius:12px;"/></div>` : '';
            return `<section class="ai-banner" style="padding:24px; background:#111827; color:#fff; text-align:center;">${title}${subtitle}${image}</section>`;
        }

        function buildLayoutHtml(design) {
            const sections = design.sections || (design.layout?.sections || []);
            if (!Array.isArray(sections) || sections.length === 0) {
                return '';
            }

            return sections
                .map((section) => {
                    const title = section.title ? `<h2>${section.title}</h2>` : '';
                    const body = section.content ? `<p>${section.content}</p>` : '';
                    const style = section.style ? `style="${Object.entries(section.style).map(([k,v]) => `${k}:${v};`).join('')}"` : '';
                    return `<section class="ai-section" data-id="${section.id || ''}" ${style}>${title}${body}</section>`;
                })
                .join('');
        }

        async function fetchThemeOptions() {
            await loadCurrentThemeLayout();
            if (currentTheme) {
                showNotification('主题配置已加载');
            } else {
                showNotification('加载主题配置失败');
            }
        }

        async function previewDesign() {
            const message = document.querySelector('#editor-message').value.trim();
            const style = document.querySelector('#editor-style').value.trim();
            const page = document.querySelector('#editor-page').value.trim();
            const audience = document.querySelector('#editor-audience').value.trim();
            const focus = document.querySelector('#editor-focus').value.trim();
            const payload = {
                message,
                context: {
                    style,
                    page,
                    audience,
                    focus,
                    editor_section: activeEditorSection,
                },
            };

            const response = await fetch(`${apiBase}/ai-editor/describe`, {
                method: 'POST',
                headers: defaultHeaders,
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                showNotification('AI 结构化描述请求失败');
                return;
            }
            const json = await response.json();
            const design = json.parsed?.data || json.data || json.design || json.result || json;
            renderDesignInEditor(design);
            renderThemeComparison();

            if (json.parsed?.success === false) {
                showNotification('AI 生成了非标准结构化内容，已尝试解析。');
            } else {
                showNotification('AI 方案已生成，可在编辑器中预览。');
            }
        }

        async function applyDesign() {
            const payload = lastDesignPayload;
            if (!payload) {
                showNotification('请先生成装修方案，然后再应用。');
                return;
            }

            const response = await fetch(`${apiBase}/ai-editor/apply`, {
                method: 'POST',
                headers: defaultHeaders,
                credentials: 'same-origin',
                body: JSON.stringify({ payload }),
            });

            if (!response.ok) {
                showNotification('应用装修方案失败');
                return;
            }
            const json = await response.json();
            document.querySelector('#editor-response-json').textContent = JSON.stringify({ applied: json, design: lastDesignPayload }, null, 2);
            showNotification('装修方案已应用到主题配置。');
            await loadCurrentThemeLayout();
        }

        function deepClone(object) {
            return JSON.parse(JSON.stringify(object));
        }

        document.querySelectorAll('.section-tab').forEach(button => {
            button.addEventListener('click', () => setTab(button.dataset.tab));
        });

        document.querySelector('#resource-modal').addEventListener('click', function (event) {
            if (event.target === this) {
                closeResourceModal();
            }
        });

        window.addEventListener('load', function () {
            loadAllCounts();
        });
    </script>
@endsection
