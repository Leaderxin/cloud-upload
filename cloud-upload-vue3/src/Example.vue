<template>
  <div class="example-container">
    <h1>Vue3 Cloud Upload 示例</h1>
    
    <div class="section">
      <h2>基础用法</h2>
      <cloud-upload
        v-model="fileList"
        :cloud-config="cloudConfig"
        cloud-type="tencent"
      />
    </div>

    <div class="section">
      <h2>阿里云OSS示例</h2>
      <cloud-upload
        v-model="aliyunFileList"
        :cloud-config="aliyunConfig"
        cloud-type="aliyun"
        list-type="picture-card"
      />
    </div>

    <div class="section">
      <h2>华为云OBS示例</h2>
      <cloud-upload
        v-model="huaweiFileList"
        :cloud-config="huaweiConfig"
        cloud-type="huawei"
        list-type="picture-card"
      />
    </div>

    <div class="section">
      <h2>高级配置示例</h2>
      <cloud-upload
        v-model="advancedFileList"
        :cloud-config="advancedConfig"
        cloud-type="tencent"
        list-type="picture-card"
        :multiple="true"
        :limit="10"
        :max-size="100"
        :slice-size="1024 * 1024 * 5"
        :chunk-size="1024 * 1024 * 2"
        key-type="uuid+name"
        :preview-config="previewConfig"
        primary-color="#67c23a"
        @change="(file, fileList) => handleChange(file, fileList)"
        @success="(response, file, fileList) => handleSuccess(response, file, fileList)"
        @error="(error, file, fileList) => handleError(error, file, fileList)"
      />
    </div>

    <div class="section">
      <h2>拖拽上传示例</h2>
      <cloud-upload
        v-model="dragFileList"
        :cloud-config="cloudConfig"
        cloud-type="tencent"
        :drag="true"
        list-type="picture"
        accept="image/*,.pdf"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CloudUpload from './components/CloudUpload.vue'

// 腾讯云配置
const cloudConfig = ref({
  bucket: 'test-tos-1257156776',
  region: 'ap-guangzhou',
  dir: 'users/1/',
  // 使用临时凭证（推荐）
  getTempCredential: async () => {
    try {
      // 这里应该调用你的后端接口获取临时凭证
      // const response = await fetch('/api/get-cos-credential')
      // return await response.json()
      
      // 示例返回数据格式
      return {
        credentials: {
          tmpSecretId: 'AKIDqj4_VsLUsJTjhNIZ22wj8PRKYpO-DbZsMgF78ZtT0TGN1NoB3JwMWalF5kodvUU7',
          tmpSecretKey: 'uXYxbxPemqE7/Cphi5kwfgJAEhW+XOx5rZQbt5kf2bw=',
          sessionToken: 'VOI3DsD7JnYZ6grpSguvoGUT10V5OB1a7bcbc519704e46913c1f5e705215d810Hg0Q0caUgnGRfPefQRL0DchQmy9_4kWLUZyAOvfAU6oTuxpZsCHUv9WSeVOzRSxt2buCJcmxyUIgKCgyHJKCZmK7FEXJ2_ZiEjLF9p5PzP_NeAjCGkdkqp3b1z2D1L3KCqlT4wKgi0EiAqBHqlUWSbbrJ-uOz9cMFrI1cOdcjMH_C_022IWrXAaukpPZxGUJ_FouNrPyEIp2ktDtUTdJpIV0EeS3AbZE83DufyrV6vLdONGJqdyn1bIwEiIIBZqcXSCOiAqh5ePk3WwTwibpgriZvPgblMW8OOlsbnf7ARzHOR273tfplgoRarQq5vZ2tjM9wf1K7-0hCySnlJ5lzjnx3OrIlHYqReKHtB1i7cKT8Q7fmA2tVu2NAkLm9QSAQ8MzhgHC7to9UIWQ6OhztOSHm-SNT_a5gUBo3HZYgZleGZ4ivah-SggHvHJtkP2LfQd0k4HMZKXmieitFjn0A6WEv0fTm_EMb1ET-BowyGCA6sj_185JtjX9PMc_cztELmU_JjhzBdD1kRuuXgTkY1wjcXnHTgVPY_1XC6M2AwMBw5j8-Frpkk2D1Jqw13y4hkyzzMfCv2zUAAue9u2bCw'
        },
        startTime: Math.floor(Date.now() / 1000),
        expiredTime: Math.floor(Date.now() / 1000) + 3600
      }
    } catch (error) {
      console.error('获取临时凭证失败:', error)
      throw error
    }
  }
})

// 阿里云配置
const aliyunConfig = ref({
  bucket: 'your-aliyun-bucket',
  region: 'oss-cn-hangzhou',
  dir: 'uploads/',
  getTempCredential: async () => {
    try {
      // 调用后端接口获取阿里云STS临时凭证
      // const response = await fetch('/api/get-oss-sts')
      // return await response.json()
      
      return {
        accessKeyId: 'your-access-key-id',
        accessKeySecret: 'your-access-key-secret',
        stsToken: 'your-sts-token'
      }
    } catch (error) {
      console.error('获取阿里云临时凭证失败:', error)
      throw error
    }
  },
  refreshSTSTokenInterval: 85000
})

// 华为云配置
const huaweiConfig = ref({
  bucket: 'your-huawei-bucket',
  region: 'cn-north-4',
  server: 'https://obs.cn-north-4.myhuaweicloud.com',
  dir: 'uploads/',
  getTempCredential: async () => {
    try {
      // 调用后端接口获取华为云临时凭证
      // const response = await fetch('/api/get-obs-credential')
      // return await response.json()
      
      return {
        credential: {
          access: 'your-access-key-id',
          secret: 'your-secret-access-key',
          securitytoken: 'your-security-token'
        },
        expires_at: new Date(Date.now() + 3600000).toISOString()
      }
    } catch (error) {
      console.error('获取华为云临时凭证失败:', error)
      throw error
    }
  }
})

// 文件列表
const fileList = ref([])
const aliyunFileList = ref([])
const huaweiFileList = ref([])
const advancedFileList = ref([])
const dragFileList = ref([])

// 高级配置
const advancedConfig = ref({
  bucket: 'your-bucket-name',
  region: 'ap-guangzhou',
  dir: 'advanced/',
  getTempCredential: async () => {
    return {
      credentials: {
        tmpSecretId: 'your-tmp-secret-id',
        tmpSecretKey: 'your-tmp-secret-key',
        sessionToken: 'your-session-token'
      },
      startTime: Math.floor(Date.now() / 1000),
      expiredTime: Math.floor(Date.now() / 1000) + 3600
    }
  }
})

// 预览配置
const previewConfig = ref({
  image: true,
  video: true,
  audio: true,
  pdf: true,
  txt: true,
  word: false,
  excel: false,
  ppt: false,
  rar: false
})

// 事件处理
const handleChange = (file: any, fileList: any[]) => {
  console.log('文件状态改变:', file, fileList)
}

const handleSuccess = (response: any, file: any, fileList: any[]) => {
  console.log('上传成功:', response, file, fileList)
}

const handleError = (error: any, file: any, fileList: any[]) => {
  console.error('上传失败:', error, file, fileList)
}
</script>

<style scoped>
.example-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #409eff;
  margin-bottom: 40px;
}

.section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}

h2 {
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}
</style>
