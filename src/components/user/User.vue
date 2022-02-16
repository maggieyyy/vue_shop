<template>
<div>
<!-- 导航面包屑 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>
<!--卡片区域-->
<el-card class="box-card">
    <el-row :gutter="20">
        <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="query" class="input-with-select" clearable>
            <el-button slot="append" icon="el-icon-search" @click="queryInfo"></el-button>
            </el-input>
        </el-col>
        <el-col :span="4">
            <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
  </el-row>
    <el-table :data="usersList" border style="width: 100%" stripe>
        <el-table-column type="index">
        </el-table-column>
        <el-table-column prop="username" label="姓名">
        </el-table-column>
        <el-table-column prop="email" label="邮箱">
        </el-table-column>
        <el-table-column prop="mobile" label="电话">
        </el-table-column>
        <el-table-column prop="role_name" label="角色">
        </el-table-column>
        <el-table-column label="状态">
        <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row.id,scope.row.mg_state)"></el-switch>
        </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUserInfo(scope.row.id)"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserInfo(scope.row.id)"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="allotRole(scope.row)"></el-button>
        </el-tooltip>
        </template>
        </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="this.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="5"
      layout="total, sizes, prev, pager, next, jumper"
      :total="this.totalpage">
    </el-pagination>
</el-card>
<!--添加用户用的对话框-->
<el-dialog
  title="添加用户"
  :visible.sync="dialogVisible"
  width="50%"
  :before-close="handleClose">
  <el-form :model="userInfo" :rules="addUserRules" ref="addUserRef" label-width="100px" class="demo-ruleForm">
  <el-form-item label="用户名" prop="username">
    <el-input v-model="userInfo.username" clearable=""></el-input>
  </el-form-item>
  <el-form-item label="密码" prop="password">
    <el-input v-model="userInfo.password" clearable=""></el-input>
  </el-form-item>
  <el-form-item label="邮箱" prop="email">
    <el-input v-model="userInfo.email" clearable=""></el-input>
  </el-form-item>
  <el-form-item label="手机" prop="mobile">
    <el-input v-model="userInfo.mobile" clearable=""></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="handleClose">取 消</el-button>
    <el-button type="primary" @click="addUser(userInfo.id)">确 定</el-button>
  </span>
</el-dialog>

<!--编辑用户信息用的对话框-->
<el-dialog
title="编辑用户信息"
:visible.sync="dialog2Visible"
width="50%"
:before-close="handleClose2">
<el-form :model="editedUserInfo" :rules="editUserRules" ref="editUserRef" label-width="100px" class="demo-ruleForm">
<el-form-item label="用户名" prop="username">
    <el-input v-model="editedUserInfo.username" clearable=""></el-input>
</el-form-item>
<el-form-item label="邮箱" prop="email">
    <el-input v-model="editedUserInfo.email" clearable=""></el-input>
</el-form-item>
<el-form-item label="手机" prop="mobile">
    <el-input v-model="editedUserInfo.mobile" clearable=""></el-input>
</el-form-item>
</el-form>
<span slot="footer" class="dialog-footer">
    <el-button @click="handleClose2">取 消</el-button>
    <el-button type="primary" @click="editUser(editedUserInfo.id)">确 定</el-button>
</span>
</el-dialog>

<!--编辑用户信息用的对话框-->
<el-dialog
title="编辑用户信息"
:visible.sync="dialog3Visible"
width="50%"
:before-close="handleClose3">
<el-form ref="allotRoleRef" :model="allotRoleInfo" label-width="100px">
<el-form-item label="分配新角色：">{{allotRoleInfo.username}}</el-form-item>
<el-form-item label="当前的角色：">{{allotRoleInfo.oldrole}}</el-form-item>
<el-form-item label="分配新角色：">
  <el-select v-model="allotRoleInfo.rid" placeholder="请选择">
  <el-option
    v-for="item in roleList"
    :key="item.id"
    :label="item.roleName"
    :value="item.id">
  </el-option>
  </el-select>
</el-form-item>
</el-form>
<span slot="footer" class="dialog-footer">
    <el-button @click="handleClose3">取 消</el-button>
    <el-button type="primary" @click="editRole()">确 定</el-button>
</span>
</el-dialog>
</div>
</template>

<script>
export default {
  created () {
    this.getUserList()
    this.getRoleList()
  },
  data () {
    var validateEmail = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入邮箱地址'))
      } else {
        if (!(/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(value))) {
          callback(new Error('输入的邮箱地址格式有误！'))
        }
        callback()
      }
    }

    var validateMobile = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入手机号码'))
      } else {
        if (!(/^[1][3,4,5,7,8][0-9]{9}$/.test(value))) {
          callback(new Error('输入的手机号码格式有误！'))
        }
        callback()
      }
    }

    return {
      query: '',
      pagenum: 1,
      pagesize: 5,
      usersList: [],
      totalpage: 0,
      dialogVisible: false,
      dialog2Visible: false,
      dialog3Visible: false,
      userInfo: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 当前用户角色信息
      allotRoleInfo: {
        username: '',
        id: '',
        oldrole: '',
        rid: ''
      },
      roleList: {},
      editedUserInfo: {},
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { validator: validateMobile, trigger: 'blur' }
        ]
      },
      editUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        email: [
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { validator: validateMobile, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: {
          query: this.query,
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.usersList = res.data.users
      this.pagenum = res.data.pagenum
      this.totalpage = res.data.total
    },
    async addUser () {
      this.$refs.addUserRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请按照要求格式输入')
          this.dialogVisible = true
          return
        }
        const { data: res } = await this.$http.post('users', this.userInfo
        )
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.dialogVisible = false
        this.getUserList()
      })
    },
    // 改变每页显示条数
    handleSizeChange (val) {
      this.pagesize = val
      this.getUserList()
    },
    handleCurrentChange (val) {
      this.pagenum = val
      this.getUserList()
    },
    queryInfo () {
      this.getUserList()
    },
    handleClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$refs.addUserRef.resetFields()
          this.dialogVisible = false
          done()
        })
        .catch(_ => {})
    },
    async changeUserState (userId, userState) {
      userId = parseInt(userId)
      const { data: res } = await this.$http.put('users/' + userId + '/state/' + userState)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
    },
    handleClose2 (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$refs.editUserRef.resetFields()
          this.dialog2Visible = false
          done()
        })
        .catch(_ => {})
    },
    async editUserInfo (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editedUserInfo = res.data
      this.dialog2Visible = true
    },
    async editUser (id) {
      this.$refs.editUserRef.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请按照要求格式输入')
          this.dialog2Visible = true
          return
        }
        const { data: res } = await this.$http.put('users/' + id, this.editedUserInfo)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.dialog2Visible = false
        this.getUserList()
      })
    },
    async deleteUserInfo (uid) {
      this.$confirm('此操作将永久删除该条用户信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('users/' + uid, { id: uid }).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error(res.data.meta.msg)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getUserList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    allotRole (role) {
      this.allotRoleInfo.username = role.username
      this.allotRoleInfo.id = role.id
      this.allotRoleInfo.oldrole = role.role_name
      this.dialog3Visible = true
    },
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) this.$message.error(res.meta.msg)
      this.roleList = res.data
    },
    async editRole () {
      const { data: res } = await this.$http.put('users/' + this.allotRoleInfo.id + '/role', { rid: this.allotRoleInfo.rid })
      if (res.meta.status !== 200) this.$message.error(res.meta.msg)
      this.dialog3Visible = false
      this.getUserList()
    },
    handleClose3 (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$refs.allotRoleRef.resetFields()
          this.dialog3Visible = false
          this.allotRoleInfo = {}
          done()
        })
        .catch(_ => {})
    }
  }
}
</script>

<style lang="less" scoped>
.el-row{
    margin-bottom: 15px;
}
</style>
