import streamlit as st
import streamlit.components.v1 as components
import os

st.set_page_config(
    page_title="萌弈少儿围棋乐园",
    page_icon="⚪",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Hide Streamlit header, footer, padding, and Community Cloud badges/icons
st.markdown(
    """
    <style>
    /* Hide Streamlit default UI chrome */
    #MainMenu {visibility: hidden; display: none !important;}
    footer {visibility: hidden; display: none !important;}
    header {visibility: hidden; display: none !important;}
    .stDeployButton {display: none !important;}
    [data-testid="stDecoration"] {display: none !important;}
    [data-testid="stStatusWidget"] {display: none !important;}
    [data-testid="stToolbar"] {display: none !important;}
    
    /* Hide Streamlit Community Cloud Manage App Button, Viewer Badge and GitHub Avatar */
    #manage-app-button,
    [data-testid="manage-app-button"],
    .viewerBadge_container,
    [class*="viewerBadge"],
    [class*="manageApp"],
    [class*="ViewerBadge"],
    [class*="ManageApp"],
    [data-testid="stToolbarActions"],
    [data-testid="stConnectionStatus"],
    div[class*="ProfileBadge"],
    div[class*="toolbarActions"],
    div:has(> #manage-app-button) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
        z-index: -9999 !important;
    }

    html, body, .stApp {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        width: 100vw !important;
        height: 100vh !important;
    }

    .block-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
        height: 100vh !important;
        overflow: hidden !important;
    }

    /* Fixed full-screen iframe overlay with top z-index to cover any cloud chrome */
    iframe {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        max-height: 100vh !important;
        min-height: 0 !important;
        border: none !important;
        overflow: hidden !important;
        z-index: 999999 !important;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

current_dir = os.path.dirname(os.path.abspath(__file__))
html_path = os.path.join(current_dir, "dist", "index.html")

if not os.path.exists(html_path):
    st.error("未找到前端打包文件 dist/index.html，请先运行构建。")
else:
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    # Render complete inlined singlefile HTML
    components.html(html_content, height=650, scrolling=False)
