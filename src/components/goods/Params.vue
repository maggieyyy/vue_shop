<template>
    <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card,gapbottom">
        <el-alert class="gapbottom"
            title="注意：只允许为第三级分类设置相关参数！"
            type="warning" show-icon>
        </el-alert>
    <label>选择商品分类：</label>
    <el-cascader class="gapbottom" :options="goodsCateList" :props="cascaderProps" v-model="selectedKeys" @change="goodsCateChange" clearable></el-cascader>
    <!-- tab标签区域-->
    <el-tabs class="gapbottom" v-model="activeName" @tab-click="getParamList">
        <el-tab-pane label="动态参数" name="many">
        <el-button class="gapbottom" type="primary" size="mini" :disabled="isBtnDisabled" @click="addParam('many')">添加参数</el-button>
        <!-- 参数/属性列表 -->
        <el-table :data="paramList" border stripe>
            <el-table-column type="expand">
                <template slot-scope="scope" width="80%">
                  <el-tag closable @close="delete2(scope.row, index)" v-for="(item,index) in scope.row.attr_vals" :key="index">
                    {{item}}
                  </el-tag>
                  <!-- 可编辑tag -->
                  <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  :key="scope.row.attr_id"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="editParamConfirm(scope.row)"
                  @blur="editParamConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
            </el-table-column>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作" width="290px">
            <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(scope.row)" >修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="delete1(scope.row)">删除</el-button>
            </template>
            </el-table-column>
        </el-table></el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
        <el-button class="gapbottom" type="primary" size="mini" :disabled="isBtnDisabled" @click="addParam('only')">添加属性</el-button>
        <!-- 参数/属性列表 -->
        <el-table :data="paramList" border stripe>
            <el-table-column type="expand">
                <template slot-scope="scope" width="80%">
                  <el-tag closable @close="delete2(scope.row,item)" v-for="(item,index) in scope.row.attr_vals" :key="index">
                    {{item}}
                  </el-tag>
                  <!-- 可编辑tag -->
                  <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="editParamConfirm(scope.row)"
                  @blur="editParamConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
            </el-table-column>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作" width="290px">
            <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(scope.row)" >修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="delete1(scope.row)">删除</el-button>
            </template>
            </el-table-column>
        </el-table></el-tab-pane>

    </el-tabs>
    </el-card>
    <!--添加参数用的对话框-->
      <el-dialog
      :title="'添加'+titleText"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleClose">
      <el-form :model="addParamInfo" :rules="addParamRules" ref="addParamRef" label-width="100px" class="demo-ruleForm">
      <el-form-item :label="titleText" prop="attr_name">
        <el-input v-model="addParamInfo.attr_name" clearable=""></el-input>
      </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="addParamConfirm()">确 定</el-button>
      </span>
      </el-dialog>

      <!--编辑参数用的对话框-->
      <el-dialog
      :title="'修改'+titleText"
      :visible.sync="dialog2Visible"
      width="50%"
      :before-close="handleClose2">
      <el-form :model="editParamInfo" :rules="addParamRules" ref="editParamRef" label-width="100px" class="demo-ruleForm">
      <el-form-item :label="titleText" prop="attr_name">
        <el-input v-model="editParamInfo.attr_name" clearable=""></el-input>
      </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="handleClose2">取 消</el-button>
          <el-button type="primary" @click="editParamNameComfirm()">确 定</el-button>
      </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  created () {
    this.getGoodsCateList()
  },
  data () {
    return {
      goodsCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      activeName: 'many',
      paramList: [],
      attrList: [],
      isBtnDisabled: true,
      addParamInfo: {
        attr_sel: '',
        attr_name: '',
        attr_vals: ''
      },
      editParamInfo: {
        attr_id: '',
        attr_sel: '',
        attr_name: '',
        attr_vals: ''
      },
      dialogVisible: false,
      dialog2Visible: false,
      addParamRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  methods: {
    async getGoodsCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goodsCateList = res.data
    },
    goodsCateChange () {
      if (this.selectedKeys.length < 3) {
        this.selectedKeys = []
        this.isBtnDisabled = true
        this.$message.error('只允许为第三级分类设置相关参数!')
      } else {
        this.isBtnDisabled = false
      }
      this.getParamList()
    },
    async getParamList () {
      if (this.selectedKeys.length === 3) {
        const id = this.selectedKeys[2]
        const { data: res } = await this.$http.get('categories/' + id + '/attributes', { params: { sel: this.activeName } })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.dealParamList(res.data)
      } else {
        this.paramList = []
      }
    },
    dealParamList (res) {
      res.forEach(item => {
        if (item.attr_vals) {
          item.inputValue = ''
          item.inputVisible = false
          item.attr_vals = item.attr_vals.split(' ')
        }
      }
      )
      this.paramList = res
    },
    editParamConfirm (param) {
      if (param.inputValue.length !== 0) {
        this.editParamInfo.attr_id = param.attr_id
        this.editParamInfo.attr_sel = param.attr_sel
        this.editParamInfo.attr_name = param.attr_name
        this.editParamInfo.attr_vals = param.attr_vals.push(param.inputValue)
        this.editParamInfo.attr_vals = param.attr_vals.join(' ')
        this.submitEdit()
      }
      param.inputVisible = false
      param.inputValue = ''
    },
    showInput (param) {
      param.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    addParam (type) {
      this.addParamInfo.attr_sel = type
      this.dialogVisible = true
    },
    async addParamConfirm () {
      const id = this.selectedKeys[2]
      const { data: res } = await this.$http.post('categories/' + id + '/attributes', this.addParamInfo
      )
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.$refs.addParamRef.resetFields()
      this.dialogVisible = false
      this.getParamList()
    },
    async editParamNameComfirm () {
      const id = this.selectedKeys[2]
      const attrId = this.editParamInfo.attr_id
      const { data: res } = await this.$http.put('categories/' + id + '/attributes/' + attrId, this.editParamInfo)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$refs.editParamRef.resetFields()
      this.dialog2Visible = false
      this.getParamList()
    },
    handleClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$refs.addParamRef.resetFields()
          this.addParamInfo.attr_name = ''
          this.dialogVisible = false
          done()
        })
        .catch(_ => {})
    },
    handleClose2 (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$refs.editParamRef.resetFields()
          this.dialog2Visible = false
          done()
        })
        .catch(_ => {})
    },
    edit (params) {
      this.editParamInfo.attr_sel = params.attr_sel
      this.editParamInfo.attr_name = params.attr_name
      this.editParamInfo.attr_vals = params.attr_vals.join(' ')
      this.editParamInfo.attr_id = params.attr_id
      this.dialog2Visible = true
    },
    async delete1 (params) {
      const id = this.selectedKeys[2]
      this.$confirm('此操作将永久删除该条参数信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('categories/' + id + '/attributes/' + params.attr_id).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error(res.data.meta.msg)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getParamList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    async delete2 (params, index) {
      this.$confirm('此操作将永久删除该条参数信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.editParamInfo.attr_id = params.attr_id
        this.editParamInfo.attr_sel = params.attr_sel
        this.editParamInfo.attr_name = params.attr_name
        params.attr_vals.splice(index, 1)
        this.editParamInfo.attr_vals = params.attr_vals.join(' ')
        if (!this.submitEdit()) return false
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    async submitEdit () {
      const id = this.selectedKeys[2]
      const attrid = this.editParamInfo.attr_id
      const { data: res } = await this.$http.put('categories/' + id + '/attributes/' + attrid, this.editParamInfo)
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
        return false
      }
      return true
    },
    addAttr () {}

  }
}
</script>

<style lang="less" scoped>
.gapbottom {
    margin-bottom: 15px;
}
.el-cascader {
    width: 280px
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: center;
}
</style>
