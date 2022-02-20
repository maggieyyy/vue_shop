<template>
    <div>
        <!-- 导航面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片 -->
        <el-card class="box-card,gapbottom">
        <!-- 添加分类按钮 -->
        <el-button class="gapbottom" type="primary" @click="getParentCateList(), dialogVisible = true">添加分类</el-button>
        <!-- 商品分类列表区域 -->
        <tree-table
            :data="cateInfo.result"
            :columns="columns"
            :selection-type="false"
            :expand-type="false"
            show-index
            index-text="#"
            border
        >
        <!-- 是否有效列 -->
            <template v-slot:isok1="scope">
            <i
                class="el-icon-success"
                style="color: lightgreen"
                v-if="scope.row.cat_deleted === false"
            ></i>
            <i class="el-icon-error" style="color: red" v-else></i
            ></template>
            <!-- 排序列 -->
            <template v-slot:isok2="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
            <el-tag v-else-if="scope.row.cat_level === 2" type="warning">三级</el-tag>
            </template>
            <!-- 操作列 -->
            <template v-slot:isok3="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="getCateInfo(scope.row)" >编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCateInfo(scope.row)">删除</el-button>
            </template>
        </tree-table>
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.cateInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.cateInfo.total">
        </el-pagination>
        </el-card>
        <!--添加分类用的对话框-->
        <el-dialog
        title="添加分类"
        :visible.sync="dialogVisible"
        width="50%"
        :before-close="handleClose">
        <el-form :model="addCateInfo" :rules="addCateRules" ref="addCateRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateInfo.cat_name" clearable=""></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
        <el-cascader :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" clearable></el-cascader>
    </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleClose">取 消</el-button>
            <el-button type="primary" @click="addCate()">确 定</el-button>
        </span>
        </el-dialog>

        <!--编辑分类信息用的对话框-->
        <el-dialog
        title="编辑用户信息"
        :visible.sync="dialog2Visible"
        width="50%"
        :before-close="handleClose2">
        <el-form :model="editCateInfo" :rules="editCateRules" ref="editCateRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="现有分类名称:" prop="old_cat_name">
            {{editCateInfo.old_cat_name}}
        </el-form-item>
        <el-form-item label="新分类名称:" prop="cat_name">
            <el-input v-model="editCateInfo.cat_name" clearable=""></el-input>
        </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleClose2">取 消</el-button>
            <el-button type="primary" @click="editCate()">确 定</el-button>
        </span>
        </el-dialog>
        </div>
</template>

<script>
export default {
  created () {
    this.getCateList()
  },
  data () {
    return {
      dialogVisible: false,
      dialog2Visible: false,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列的模板名称
          template: 'isok1'
        },
        {
          label: '排序',
          type: 'template',
          template: 'isok2'
        },
        {
          label: '操作',
          type: 'template',
          template: 'isok3'
        }
      ],
      reqCate: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateInfo: {},
      addCateInfo: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      parentCateList: [],
      // 选定的父级分类的id数据
      selectedKeys: [],
      editCateInfo: {
        id: '',
        cat_name: '',
        old_cat_name: ''
      }
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.reqCate })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateInfo = res.data
    },
    getCateInfo (cate) {
      this.editCateInfo.old_cat_name = cate.cat_name
      this.editCateInfo.cat_id = cate.cat_id
      this.dialog2Visible = true
    },
    async editCate () {
      this.$refs.editCateRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请按照要求格式输入')
          this.dialog2Visible = true
          return
        }
        const { data: res } = await this.$http.put('categories/' + this.editCateInfo.cat_id, { cat_name: this.editCateInfo.cat_name })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.$refs.editCateRef.resetFields()
        this.editCateInfo.cat_id = 0
        this.editCateInfo.cat_name = ''
        this.editCateInfo.old_cat_name = ''
        this.dialog2Visible = false
        this.getCateList()
      })
    },
    async deleteCateInfo (role) {
      this.$confirm('此操作将永久删除该条分类信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('categories/' + role.cat_id).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error(res.data.meta.msg)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getCateList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 改变每页显示条数
    handleSizeChange (val) {
      this.reqCate.pagesize = val
      this.getCateList()
    },
    handleCurrentChange (val) {
      this.reqCate.pagenum = val
      this.getCateList()
    },
    handleClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$refs.addCateRef.resetFields()
          this.selectedKeys = []
          this.addCateInfo.cat_pid = 0
          this.addCateInfo.cat_name = ''
          this.addCateInfo.cat_level = 0
          this.dialogVisible = false
          done()
        })
        .catch(_ => {})
    },
    handleClose2 (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$refs.editCateRef.resetFields()
          this.dialog2Visible = false
          done()
        })
        .catch(_ => {})
    },
    async addCate () {
      this.$refs.addCateRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请按照要求格式输入')
          this.dialogVisible = true
          return
        }
        this.addCateInfo.cat_level = this.selectedKeys.length
        this.addCateInfo.cat_pid = this.selectedKeys.length === 0 ? 0 : this.selectedKeys[this.selectedKeys.length - 1]
        const { data: res } = await this.$http.post('categories', this.addCateInfo)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.$refs.addCateRef.resetFields()
        this.selectedKeys = []
        this.addCateInfo.cat_pid = 0
        this.addCateInfo.cat_name = ''
        this.addCateInfo.cat_level = 0
        this.dialogVisible = false
        this.getCateList()
      })
    },
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败')
      this.parentCateList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.gapbottom {
    margin-bottom: 15px;
}
.el-cascader {
    width: 100%
}
</style>
