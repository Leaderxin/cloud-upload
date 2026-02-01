<template>
  <div class="watermark-example">
    <h2>图片水印功能示例</h2>
    
    <!-- 水印配置面板 -->
    <el-card class="config-panel">
      <div slot="header">
        <span>水印配置</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="resetConfig"
        >
          重置配置
        </el-button>
      </div>
      
      <el-form :model="config" label-width="120px">
        <el-form-item label="水印类型">
          <el-radio-group v-model="config.type">
            <el-radio label="text">文字水印</el-radio>
            <el-radio label="image">图片水印</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 文字水印配置 -->
        <template v-if="config.type === 'text'">
          <el-form-item label="水印文字">
            <el-input v-model="config.text" placeholder="请输入水印文字" />
          </el-form-item>
          
          <el-form-item label="字体大小">
            <el-slider
              v-model="config.font_size"
              :min="10"
              :max="100"
              show-input
            />
          </el-form-item>
          
          <el-form-item label="字体颜色">
            <el-color-picker v-model="config.font_color" />
          </el-form-item>
        </template>
        
        <!-- 图片水印配置 -->
        <template v-if="config.type === 'image'">
          <el-form-item label="水印图片">
            <el-upload
              action="#"
              :show-file-list="false"
              :before-upload="handleWatermarkImageUpload"
              accept="image/*"
            >
              <el-button size="small" type="primary">选择图片</el-button>
            </el-upload>
            <div v-if="config.image_data" class="watermark-preview">
              <img :src="config.image_data" alt="水印预览" />
            </div>
          </el-form-item>
          
          <el-form-item label="图片宽度">
            <el-input-number
              v-model="config.width"
              :min="10"
              :max="500"
            />
          </el-form-item>
          
          <el-form-item label="图片高度">
            <el-input-number
              v-model="config.height"
              :min="10"
              :max="500"
            />
          </el-form-item>
        </template>
        
        <!-- 通用配置 -->
        <el-form-item label="透明度">
          <el-slider
            v-model="config.transparency"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </el-form-item>
        
        <el-form-item label="旋转角度">
          <el-slider
            v-model="config.rotate"
            :min="0"
            :max="360"
            show-input
          />
        </el-form-item>
        
        <el-form-item label="X轴偏移">
          <el-input-number v-model="config.x_offset" />
        </el-form-item>
        
        <el-form-item label="Y轴偏移">
          <el-input-number v-model="config.y_offset" />
        </el-form-item>
        
        <el-form-item label="平铺模式">
          <el-switch v-model="config.tile" />
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 上传组件 -->
    <el-card class="upload-panel">
      <div slot="header">
        <span>上传图片</span>
      </div>
      
      <cloud-upload
        v-model="fileList"
        :cloud-config="cloudConfig"
        :watermark-config="watermarkConfig"
        :multiple="true"
        :limit="10"
        accept="image/*"
      />
    </el-card>
    
    <!-- 配置预览 -->
    <el-card class="code-preview">
      <div slot="header">
        <span>配置代码预览</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="copyConfig"
        >
          复制配置
        </el-button>
      </div>
      
      <pre><code>{{ configCode }}</code></pre>
    </el-card>
  </div>
</template>

<script>
import CloudUpload from '@/components/CloudUpload.vue';

export default {
  name: 'WatermarkExample',
  components: {
    CloudUpload
  },
  data() {
    return {
      fileList: [],
      cloudConfig: {
        // 请替换为实际的云平台配置
        bucket: 'your-bucket-name',
        region: 'your-region',
        path: 'uploads/',
        getAuthorization: async () => {
          // 返回临时凭证
          return {
            credentials: {
              tmpSecretId: 'your-secret-id',
              tmpSecretKey: 'your-secret-key',
              sessionToken: 'your-session-token'
            },
            startTime: Date.now(),
            expiredTime: Date.now() + 3600000
          };
        }
      },
      config: {
        type: 'text',
        text: '我的水印',
        font: 'Arial',
        font_size: 30,
        font_color: '#FFFFFF',
        transparency: 0.5,
        rotate: 0,
        x_offset: 10,
        y_offset: 10,
        tile: false
      }
    };
  },
  computed: {
    watermarkConfig() {
      return { ...this.config };
    },
    configCode() {
      return JSON.stringify(this.watermarkConfig, null, 2);
    }
  },
  methods: {
    handleWatermarkImageUpload(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.config.image_data = e.target.result;
      };
      reader.readAsDataURL(file);
      return false;
    },
    resetConfig() {
      this.config = {
        type: 'text',
        text: '我的水印',
        font: 'Arial',
        font_size: 30,
        font_color: '#FFFFFF',
        transparency: 0.5,
        rotate: 0,
        x_offset: 10,
        y_offset: 10,
        tile: false
      };
    },
    copyConfig() {
      navigator.clipboard.writeText(this.configCode).then(() => {
        this.$message.success('配置已复制到剪贴板');
      }).catch(() => {
        this.$message.error('复制失败');
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.watermark-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }
  
  .config-panel,
  .upload-panel,
  .code-preview {
    margin-bottom: 20px;
  }
  
  .watermark-preview {
    margin-top: 10px;
    
    img {
      max-width: 200px;
      max-height: 200px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    
    code {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #333;
    }
  }
}
</style>