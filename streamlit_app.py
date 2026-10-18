import streamlit as st
import streamlit.components.v1 as components
import os

st.set_page_config(
    page_title="萌弈少儿围棋乐园",
    page_icon="⚪",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Hide Streamlit header, footer, padding for full screen experience
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
        width: 100vw !important;
        height: 100vh !important;
        border: none !important;
        display: block;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

current_dir = os.path.dirname(os.path.abspath(__file__))
dist_dir = os.path.join(current_dir, "dist")

if not os.path.exists(dist_dir):
    st.error("未找到前端打包目录 dist，请先执行 npm run build")
else:
    # Use declare_component with path pointing to dist
    kid_go = components.declare_component("kid_go", path=dist_dir)
    kid_go()
