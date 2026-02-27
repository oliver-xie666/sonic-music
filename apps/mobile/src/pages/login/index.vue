<template>
  <view class="page">
    <view class="container">
      <!-- Logo -->
      <view class="logo-wrap">
        <view class="logo-icon">♪</view>
        <text class="logo-text">Sonic Music</text>
      </view>

      <text class="title">登录酷狗账号</text>

      <!-- Tab 切换 -->
      <view class="tabs">
        <view
          v-for="tab in tabs"
          :key="tab"
          class="tab"
          :class="{ active: loginType === tab }"
          @click="switchTab(tab)"
        >
          <text class="tab-text">{{ tab }}</text>
        </view>
      </view>

      <!-- 手机号登录 -->
      <view v-if="loginType === '手机号登录'">
        <!-- 多账号选择 -->
        <view v-if="showAccountList" class="account-list">
          <text class="account-tip">该手机绑定多个账号，请选择</text>
          <view
            v-for="acc in accountList"
            :key="acc.userid"
            class="account-item"
            @click="selectAccount(acc)"
          >
            <image class="account-avatar" :src="acc.pic || ''" mode="aspectFill" />
            <view class="account-info">
              <text class="account-name">{{ acc.nickname || '未命名用户' }}</text>
              <text class="account-uid">UID: {{ acc.userid }}</text>
            </view>
            <text class="account-arrow">›</text>
          </view>
          <view class="btn-outline" @click="showAccountList = false">
            <text class="btn-outline-text">返回</text>
          </view>
        </view>

        <!-- 手机号表单 -->
        <view v-else class="form">
          <view class="input-wrap">
            <input
              class="input"
              v-model="phone.mobile"
              type="number"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </view>
          <view class="input-wrap code-wrap">
            <input
              class="input code-input"
              v-model="phone.code"
              type="number"
              placeholder="请输入验证码"
              maxlength="6"
            />
            <view
              class="send-btn"
              :class="{ disabled: countdown > 0 || !phone.mobile }"
              @click="sendCaptcha"
            >
              <text class="send-btn-text">{{ countdown > 0 ? `${countdown}s` : '发送验证码' }}</text>
            </view>
          </view>
          <view class="btn-primary" :class="{ loading: phoneLoading }" @click="phoneLogin()">
            <text class="btn-text">{{ phoneLoading ? '登录中...' : '立即登录' }}</text>
          </view>
        </view>
      </view>

      <!-- 邮箱登录 -->
      <view v-if="loginType === '邮箱登录'" class="form">
        <view class="input-wrap">
          <input
            class="input"
            v-model="email.account"
            placeholder="请输入登录邮箱"
          />
        </view>
        <view class="input-wrap">
          <input
            class="input"
            v-model="email.password"
            :password="true"
            placeholder="请输入密码"
          />
        </view>
        <view class="btn-primary" :class="{ loading: emailLoading }" @click="emailLogin">
          <text class="btn-text">{{ emailLoading ? '登录中...' : '邮箱登录' }}</text>
        </view>
      </view>

      <!-- 提示 -->
      <text class="disclaimer">登录即表示同意相关服务协议，推荐使用验证码登录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onUnload } from '@dcloudio/uni-app'
import { login } from '@/api/user'
import { get } from '@/api/client'
import { MoeAuthStore } from '@sonic-music/shared/stores/auth'

const MoeAuth = MoeAuthStore()

const tabs = ['手机号登录', '邮箱登录']
const loginType = ref('手机号登录')

const phone = reactive({ mobile: '', code: '' })
const email = reactive({ account: '', password: '' })

const phoneLoading = ref(false)
const emailLoading = ref(false)
const countdown = ref(0)
const showAccountList = ref(false)
const accountList = ref([])

let countdownTimer = null

function switchTab(tab) {
  loginType.value = tab
  showAccountList.value = false
}

async function sendCaptcha() {
  if (countdown.value > 0 || !phone.mobile) return
  if (!/^1\d{10}$/.test(phone.mobile)) {
    uni.showToast({ title: '手机号格式错误', icon: 'none' })
    return
  }
  try {
    const res = await get('/captcha/sent', { mobile: phone.mobile })
    if (res.status === 1) {
      uni.showToast({ title: '验证码已发送', icon: 'success' })
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(countdownTimer)
      }, 1000)
    }
  } catch (e) {
    uni.showToast({ title: '发送失败，请重试', icon: 'none' })
  }
}

async function phoneLogin(selectedUserId = null) {
  if (!phone.mobile || !phone.code) {
    uni.showToast({ title: '请填写手机号和验证码', icon: 'none' })
    return
  }
  phoneLoading.value = true
  try {
    let url = `/login/cellphone?mobile=${phone.mobile}&code=${phone.code}`
    if (selectedUserId) url += `&userid=${selectedUserId}`
    const res = await get(url)
    if (res.status === 1) {
      await MoeAuth.setData({ UserInfo: res.data })
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 800)
    }
  } catch (e) {
    const infoList = e?.data?.info_list
    if (infoList && !selectedUserId) {
      accountList.value = infoList
      showAccountList.value = true
    } else {
      uni.showToast({ title: e?.data || '登录失败', icon: 'none' })
    }
  } finally {
    phoneLoading.value = false
  }
}

async function emailLogin() {
  if (!email.account || !email.password) {
    uni.showToast({ title: '请填写邮箱和密码', icon: 'none' })
    return
  }
  emailLoading.value = true
  try {
    const res = await get(`/login?username=${email.account}&password=${email.password}`)
    if (res.status === 1) {
      await MoeAuth.setData({ UserInfo: res.data })
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 800)
    }
  } catch (e) {
    uni.showToast({ title: e?.data || '登录失败', icon: 'none' })
  } finally {
    emailLoading.value = false
  }
}

function selectAccount(acc) {
  phoneLogin(acc.userid)
}

onUnload(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background-color, #FFF0F5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
}
.container {
  width: 100%;
  background: #fff;
  border-radius: 32rpx;
  padding: 60rpx 48rpx 48rpx;
  box-shadow: 0 8rpx 40rpx rgba(255, 105, 180, 0.1);
}
.logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}
.logo-icon {
  font-size: 80rpx;
  color: var(--primary-color, #FF69B4);
  line-height: 1;
}
.logo-text {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--primary-color, #FF69B4);
  margin-top: 8rpx;
  letter-spacing: 2rpx;
}
.title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-primary, #333);
  text-align: center;
  margin-bottom: 40rpx;
}
.tabs {
  display: flex;
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 6rpx;
  margin-bottom: 40rpx;
}
.tab {
  flex: 1;
  padding: 18rpx 0;
  border-radius: 12rpx;
  text-align: center;
}
.tab.active {
  background: var(--primary-color, #FF69B4);
}
.tab-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #999;
}
.tab.active .tab-text {
  color: #fff;
  font-weight: 600;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.input-wrap {
  background: #f9f9f9;
  border-radius: 16rpx;
  border: 2rpx solid #f0f0f0;
  overflow: hidden;
}
.input {
  width: 100%;
  height: 96rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
  color: var(--text-primary, #333);
  box-sizing: border-box;
}
.code-wrap {
  display: flex;
  align-items: center;
}
.code-input {
  flex: 1;
}
.send-btn {
  padding: 0 28rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  background: var(--primary-color, #FF69B4);
  flex-shrink: 0;
}
.send-btn.disabled {
  background: #ddd;
}
.send-btn-text {
  font-size: 24rpx;
  color: #fff;
  white-space: nowrap;
}
.btn-primary {
  height: 96rpx;
  background: var(--primary-color, #FF69B4);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
}
.btn-primary.loading {
  opacity: 0.7;
}
.btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}
.disclaimer {
  display: block;
  font-size: 22rpx;
  color: #bbb;
  text-align: center;
  margin-top: 40rpx;
  line-height: 1.6;
}
/* 多账号选择 */
.account-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.account-tip {
  display: block;
  font-size: 26rpx;
  color: var(--text-secondary, #999);
  text-align: center;
  margin-bottom: 8rpx;
}
.account-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 24rpx;
  background: #f9f9f9;
  border-radius: 16rpx;
  border: 2rpx solid #f0f0f0;
}
.account-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f0f0f0;
  flex-shrink: 0;
}
.account-info {
  flex: 1;
}
.account-name {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--text-primary, #333);
}
.account-uid {
  display: block;
  font-size: 22rpx;
  color: var(--text-secondary, #999);
  margin-top: 4rpx;
}
.account-arrow {
  font-size: 40rpx;
  color: var(--primary-color, #FF69B4);
}
.btn-outline {
  height: 88rpx;
  border-radius: 16rpx;
  border: 2rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
}
.btn-outline-text {
  font-size: 28rpx;
  color: var(--text-secondary, #999);
}
</style>
