<template>
    <div class="center-container">
        <div class="status-bar">
            <span v-if="loginExpired === null">登录状态检测中...</span>
            <span v-else-if="loginExpired" class="status-expired">登录状态已过期，请输入验证码授权</span>
            <span v-else class="status-normal">登录状态正常</span>
            <span v-if="loginMsg" class="status-msg">{{ loginMsg }}</span>
            <button class="refresh-status-btn" @click="checkLoginStatus">刷新登录状态</button>
        </div>
        <div class="captcha-box">
            <div v-if="captchaImg">
                <img :src="captchaImg" alt="验证码" class="captcha-img" @click="fetchCaptcha" title="点击刷新验证码" />
            </div>
            <div v-else>正在加载验证码...</div>
            <input v-model="captchaInput" placeholder="请输入验证码" class="captcha-input" />
            <button @click="handleAuth" class="auth-btn">授权</button>
        </div>
    </div>
</template>
<script>
import axios from 'axios';
import { getAction, postAction } from '@/api/manage'
export default {
    data() {
        return {
            captchaImg: '',
            captchaInput: '',
            uuid: '',
            loginExpired: null, // null: 检测中, true: 过期, false: 正常
            loginMsg: ''
        }
    },
    mounted() {
        this.checkLoginStatus();
        this.fetchCaptcha();
    },
    methods: {
        generateUUID() {
            // 生成标准UUID v4格式，前8位用当前时间戳（16进制），其余部分用随机算法
            const timestamp = Date.now().toString(16).padStart(8, '0').slice(-8);
            let template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
            let uuid = template.replace(/[xy]/g, function (c, i) {
                if (i < 8) {
                    return timestamp[i];
                }
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            return uuid;
        },
        async fetchCaptcha() {
            this.uuid = this.generateUUID();
            const url = `https://bwc.ganfanniu.com/sqx_fast/captcha.jpg?uuid=${this.uuid}`;
            try {
                // axios请求，responseType: 'blob' 兼容图片流
                const response = await axios.get(url, { responseType: 'blob' });
                // 尝试解析为json（如果是json返回）
                const text = await response.data.text();
                try {
                    const data = JSON.parse(text);
                    if (data && data.img) {
                        this.captchaImg = data.img;
                    } else if (data && data.code === 500) {
                        this.captchaImg = '';
                        this.$message && this.$message.error(data.msg || '获取验证码失败');
                    }
                } catch (e) {
                    // 不是json，直接当图片流处理
                    const blob = response.data;
                    this.captchaImg = URL.createObjectURL(blob);
                    // // console.log(this.captchaImg);
                }
            } catch (err) {
                this.captchaImg = '';
            }
        },
        async checkLoginStatus() {
            // 使用 getAction 检查登录状态
            try {
                const url = '/promotionStats/checkExpiration';
                const res = await getAction(url);
                this.loginExpired = res && res.expired;
                this.loginMsg = res && res.message ? res.message : '';
                this.$message && this.$message.success('登录状态刷新成功');
            } catch (e) {
                this.loginExpired = null;
                this.loginMsg = '';
                this.$message && this.$message.error('登录状态刷新失败');
            }
        },
        async handleAuth() {
            if (!this.captchaInput) {
                this.$message && this.$message.warning('请输入验证码');
                return;
            }
            try {
                const url = '/promotionStats/login';
                const res = await postAction(url, {
                    captcha: this.captchaInput,
                    uuid: this.uuid
                });
                if (res && res.success) {
                    this.$message && this.$message.success('授权成功！');
                    this.fetchCaptcha();
                    this.checkLoginStatus();
                    this.loginExpired = false;
                } else {
                    this.$message && this.$message.error(res.data && res.data.msg ? res.data.msg : '授权失败');
                    this.fetchCaptcha(); // 失败刷新验证码
                }
            } catch (e) {
                this.$message && this.$message.error('授权请求失败');
                this.fetchCaptcha();
            }
        }
    }
}
</script>
<style>
.center-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #f5f6fa;
    padding-top: 8px;
    padding-bottom: 400px;
}

.status-bar {
    margin-bottom: 32px;
    font-size: 18px;
    color: #333;
}

.captcha-box {
    background: #fff;
    padding: 32px 60px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 340px;
    max-width: 90vw;
    margin-left: auto;
    margin-right: auto;
}

.captcha-img {
    width: 180px;
    height: 60px;
    margin-bottom: 16px;
    border-radius: 4px;
    border: 1px solid #eee;
    cursor: pointer;
}

.captcha-input {
    width: 180px;
    height: 36px;
    margin-bottom: 16px;
    padding: 0 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 16px;
}

.auth-btn {
    width: 180px;
    height: 38px;
    background: #1890ff;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s;
}

.auth-btn:hover {
    background: #40a9ff;
}

.refresh-status-btn {
    margin-left: 24px;
    padding: 4px 16px;
    font-size: 14px;
    border: 1px solid #1890ff;
    background: #fff;
    color: #1890ff;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.refresh-status-btn:hover {
    background: #1890ff;
    color: #fff;
}

.status-expired {
    color: #ff4d4f;
    font-weight: bold;
}

.status-normal {
    color: #52c41a;
    font-weight: bold;
}

.status-msg {
    margin-left: 16px;
    color: #888;
    font-size: 14px;
}
</style>