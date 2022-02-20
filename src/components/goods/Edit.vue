<template>
    <div>
     <!-- 导航面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/goods'}">商品列表</el-breadcrumb-item>
        <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
        <el-alert center class="gapbottom center"
            title="编辑商品信息！"
            type="info" show-icon :closable="false">
        </el-alert>
        <el-steps class="gapbottom" :active="active-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
    </el-steps>
    <el-form :model="goodsInfo" :rules="addGoodsRules1" ref="addGoodsRef1"  label-position="top" class="demo-ruleForm">
         <el-tabs tab-position="left" v-model="active" :before-leave="beforeTabLeave">
        <el-tab-pane label="基本信息" name="0">
        <div>
        <!--基本信息表单区域-->
       <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="goodsInfo.goods_name" clearable=""></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="goods_price">
            <el-input v-model="goodsInfo.goods_price" type="number" clearable=""></el-input>
        </el-form-item>
        <el-form-item label="数量" prop="goods_number">
            <el-input v-model="goodsInfo.goods_number" type="number" clearable=""></el-input>
        </el-form-item>
        <el-form-item label="重量" prop="goods_weight">
            <el-input v-model="goodsInfo.goods_weight" type="number" clearable=""></el-input>
        </el-form-item>
        </div>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
         <!-- 商品参数表单区域 -->
        <el-form-item v-for="param in manyParamList" :label="param.attr_name" :key="param.attr_id">
            <el-checkbox-group  v-model="param.attr_vals">
            <el-checkbox v-for="(item,index) in param.attr_vals" :key="index" :label="item" border>
            </el-checkbox>
        </el-checkbox-group>
        </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
        <!-- 商品属性表单区域 -->
        <el-form-item v-for="(only,index) in onlyParamList" :label="only.attr_name" :key="index">
            <el-input v-model="only.attr_vals" clearable=""></el-input>
        </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
        <!-- 商品图片区域 -->
        <el-upload
        class="upload-demo"
        action="http://127.0.0.1:8888/api/private/v1/upload"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        list-type="picture"
        :headers="headerObj"
        :file-list="filelist"
        :on-success="uploadSuccess">
        <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
            <!-- 商品内容区域 -->
        <quill-editor
            class="gapbottom ,ql-editor"
            v-model="goodsInfo.goods_introduce"
        />
        <el-button type="primary" @click="addGood">添加商品</el-button>
        </el-tab-pane>
        </el-tabs>
       </el-form>
    </el-card>
    <!--图片预览-->
    <el-dialog
    title="图片预览"
    :visible.sync="previewVisible"
    width="50%"
    :before-close="handleClose">
    <img :src="previewPath" alt="" class="previewImg"/>
    </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
  created () {
    this.getGoodInfo()
  },
  data () {
    return {
      active: 0,
      goodsInfo: {},
      goodsId: this.$route.query.goods_id,
      addGoodsRules1: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [
          { required: true, message: '请输入价格', trigger: 'blur' }],
        goods_number: [
          { required: true, message: '请输入数量', trigger: 'blur' }],
        goods_weight: [
          { required: true, message: '请输入重量', trigger: 'blur' }],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'change' }]
      },
      cateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      isFormOneValid: false,
      manyParamList: [],
      onlyParamList: [],
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false,
      filelist: []
    }
  },
  methods: {
    async getGoodInfo () {
      const { data: res } = await this.$http.get('goods/' + this.goodsId)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goodsInfo = res.data
      res.data.pics.forEach(item => {
        const pic = { name: item.pics_id, url: item.pics_mid_url }
        this.filelist.push(pic)
      })
      res.data.attrs.forEach(item => {
        if (item.attr_sel === 'many') {
          const many = { attr_id: item.attr_id, attr_vals: item.attr_vals.split(' ') }
          this.manyParamList.push(many)
        } else {
          const only = { attr_id: item.attr_id, attr_vals: item.attr_vals }
          this.onlyParamList.push(only)
        }
      })
    },
    goodsCateChange () {
      if (this.goodsInfo.goods_cat.length < 3) {
        this.goodsInfo.goods_cat = []
        this.$message.error('只允许为第三级分类添加商品!')
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0') {
        this.validateStepOne()
        return this.isFormOneValid
      }
    },
    validateStepOne () {
      console.log('va')
      this.$refs.addGoodsRef1.validate((valid) => {
        if (!valid) {
          this.$message.error('请按照要求格式输入')
          this.isFormOneValid = false
          return
        }
        if (this.goodsInfo.goods_cat === '') {
          this.$message.error('请按照商品分类')
          this.isFormOneValid = false
          return
        }
        this.isFormOneValid = true
        return true
      })
    },
    handleRemove (file, fileList) {
      const filepath = file.url
      const i =
        this.filelist.findIndex(x =>
          x.url === filepath)
      this.filelist.splice(i, 1)
    },
    handlePreview (file) {
      this.previewPath = file.url
      this.previewVisible = true
    },
    uploadSuccess (response) {
      const picInfo = { url: response.data.tmp_path }
      this.filelist.push(picInfo)
    },
    handleClose () {
      this.previewPath = ''
      this.previewVisible = false
    },
    async addGood () {
      const addGoodInfo = _.cloneDeep(this.goodsInfo)
      this.manyParamList.forEach(item => {
        const param = {
          attr_id: item.attr_id,
          attr_vals: item.attr_vals.length !== 0 ? item.attr_vals.join(' ') : ''
        }
        addGoodInfo.attrs.push(param)
      })
      this.onlyParamList.forEach(item => {
        const param = {
          attr_id: item.attr_id,
          attr_vals: item.attr_vals
        }
        addGoodInfo.attrs.push(param)
      })
      addGoodInfo.pics = []
      this.filelist.forEach(item => {
        const pic = { pic: item.url }
        addGoodInfo.pics.push(pic)
      })
      const { data: res } = await this.$http.put('goods/' + this.goodsId, addGoodInfo)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$router.push('/goods')
    }
  }
}

</script>

<style lang="less" scoped>
.gapbottom {
    margin-bottom: 15px;
}
.dialog-footer {
    display: flex;
    text-align: center;
    justify-content: center;
}
.el-cascader {
    width: 280px
}
.el-checkbox {
    margin:0 5px 0 0 !important
}
.previewImg{
    width: 100%
}
</style>
