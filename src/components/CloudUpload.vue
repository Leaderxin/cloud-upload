<template>
  <div class="cloud-upload">
    <el-upload
      action="#"
      :file-list="fileList"
      :multiple="multiple"
      :accept="accept"
      :limit="limit"
      :drag="drag"
      :show-file-list="showFileList"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :before-upload="beforeUpload"
      :http-request="customUpload"
      :list-type="listType"
    >
    <i slot="default" class="el-icon-plus"></i>
     <div slot="file" slot-scope="{file}">
      <img
        class="el-upload-list__item-thumbnail"
        :src="file.url" alt=""
      >
      <span class="el-upload-list__item-actions">
        <span
          class="el-upload-list__item-preview"
        >
          <i class="el-icon-view"></i>
        </span>
        <span
          v-if="!disabled"
          class="el-upload-list__item-delete"
        >
          <i class="el-icon-download"></i>
        </span>
        <span
          v-if="!disabled"
          class="el-upload-list__item-delete"
          @click="handleRemove(file)"
        >
          <i class="el-icon-delete"></i>
        </span>
      </span>
    </div>
    </el-upload>
  </div>
</template>

<script>
import Vue from 'vue'
import CosHelper from "../plugins/tencent";
import { Upload } from 'element-ui'
Vue.component('el-upload', Upload)
export default {
  name: "CloudUpload",
  props: {
    /**
     * 是否支持多选文件
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * 是否显示已上传文件列表
     */
    showFileList: {
      type: Boolean,
      default: true,
    },
    /**
     * 是否启用拖拽上传
     */
    drag: {
      type: Boolean,
      default: false,
    },
    /**
     * 接受上传的文件类型（thumbnail-mode 模式下此参数无效）
     */
    accept: {
      type: String,
    },
    /**
     * 文件列表的类型 text/picture/picture-card
     */
    listType: {
      type: String,
      default: "picture-card",
    },
    /**
     * 是否禁用
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * 最大允许上传个数
     */
    limit: {
      type: Number,
    },
    /**
     * 单个附件大小限制mb
     */
    maxSize:{
      type: Number
    },
    /**
     * 使用的云平台类型 tencent腾讯云桶
     */
    cloudType: {
      type: String,
      default: "tencent",
    },
    /**
     * 云平台配置参数，包含桶名，地域，上传目录，凭证获取等
     */
    cloudConfig: {
      type: Object,
      required: true,
      default: () => ({
        bucket:'',
        region:'',
        path:'',
        getTempCredential:()=>{
          return{
            TmpSecretId:'',
            TmpSecretKey:'',
            SecurityToken:'',
            StartTime:'',
            ExpiredTime:''
          }
        }
      }),
    },
    /**
     * 自定义v-model
     */
    value:{
      type: Array,
      default: () =>{[]}
    }
  },
  data() {
    return {
      fileList: this.value,
    };
  },
  created(){
    debugger
    //检查关键参数传入
    const typeList = ['tencent']
    if(!this.cloudType){
      console.warn('未设置云平台类型cloudType!')
    }
    else if(!typeList.includes(this.cloudType)){
      debugger
      console.warn(`云平台类型cloudType设置错误，应为${typeList.join('/')}`)
    }
    switch (this.cloudType) {
      case 'tencent':
        CosHelper.getInstance(this.cloudConfig.getTempCredential)
        break;
      default:
        break;
    }
  },
  methods: {
    // 自定义上传方法
    async customUpload(options) {
      const { file, onProgress, onSuccess, onError } = options;
      const uploadConfig = {
        file,
        ...this.cloudConfig,
        onProgress: (progressEvent) => {
          // 计算进度并触发事件
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress({ percent });
          this.$emit("progress", percent, file);
        },
      };

      try {
        let result;
        // 根据云平台类型选择上传方法
        switch (this.cloudType) {
          case "tencent":
            result = await CosHelper.getInstance().uploadFile(uploadConfig);
            break;
          case "volcengine":
            result = await tencentUpload(uploadConfig);
            //result = await volcengineUpload(uploadConfig);
            break;
          default:
            throw new Error(`Unsupported cloud type: ${this.cloudType}`);
        }
        onSuccess(result, file);
        this.$emit("success", result, file);
      } catch (error) {
        onError(error);
        this.$emit("error", error, file);
      }
    },

    beforeUpload(file) {
      // 文件类型和大小校验逻辑
      const isTypeValid = this.accept
        ? this.accept.split(",").includes(file.type)
        : true;
      const isSizeValid = this.maxSize
        ? file.size / 1024 / 1024 < this.maxSize
        : true;

      if (!isTypeValid) {
        this.$message.error(`文件类型必须是 ${this.accept} 中的一种!`);
        return false;
      }
      if (!isSizeValid) {
        this.$message.error(`文件大小不能超过 ${this.maxSize}MB!`);
        return false;
      }
      this.$emit("before-upload", file);
      return true;
    },
    handleRemove(file, fileList) {
      this.fileList = fileList;
      this.$emit("remove", file, fileList);
    },

    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 ${this.limit} 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      );
      this.$emit("exceed", files, fileList);
    },
  },
  watch:{
    value(val){
      this.fileList = val
    },
    cloudType(val){

    }
  }
};
</script>
<style scoped>
/* 你的样式 */
</style>
