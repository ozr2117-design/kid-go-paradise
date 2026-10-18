import streamlit as st
import streamlit.components.v1 as components
import os

st.set_page_config(
    page_title="萌弈少儿围棋乐园",
    page_icon="⚪",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Hide Streamlit header, footer, padding
st.markdown(
    """
    <style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .block-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
    }
    iframe {
        width: 100% !important;
        height: 98vh !important;
        min-height: 880px !important;
        border: none !important;
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
    components.html(html_content, height=920, scrolling=True)
