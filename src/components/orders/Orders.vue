<template>
    <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
        <el-row :gutter="20" class="gapbottom">
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="reqOrdersList.query" class="input-with-select" clearable>
                <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
           </el-col>
        </el-row>
        <el-table class="gapbottom" :data="ordersList" border style="width: 100%" stripe>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column prop="order_number" label="订单编号">
            </el-table-column>
            <el-table-column prop="order_price" width="100px" label="订单价格(元)">
            </el-table-column>
            <el-table-column prop="pay_status" width="100px" label="是否付款">
                <template slot-scope="scope">
                <el-tag v-if="scope.row.pay_status==='0'" type="danger">未付款</el-tag>
                <el-tag v-else type="success">已付款</el-tag></template>
            </el-table-column>
            <el-table-column prop="is_send" width="100px" label="是否发货">
            </el-table-column>
            <el-table-column prop="create_time" width="200px" label="下单时间">
                <template slot-scope="scope">
                    {{scope.row.create_time | dateFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="130px">
            <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="修改地址" placement="top" :enterable="false">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAdd()"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="查看物流" placement="top" :enterable="false">
                <el-button type="success" icon="el-icon-location" size="mini" @click="getKuaidi(scope.row.order_id)"></el-button>
            </el-tooltip>
            </template>
            </el-table-column>
        </el-table>
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.reqOrdersList.pagenum"
        :page-sizes="[20, 50, 100 ,500]"
        :page-size="20"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.totalpage">
        </el-pagination>
    </el-card>
        <!--修改地址用的对话框-->
        <el-dialog
        title="修改地址(暂无接口）"
        :visible.sync="dialogVisible"
        width="50%"
        :before-close="handleClose">
        <el-form :model="addressInfo" :rules="addressRules" ref="addressRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="省市区/县" prop="address">
        <el-cascader :options="citydata" v-model="addressInfo.address" clearable></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="addressDetail">
            <el-input v-model="addressInfo.addressDetail" clearable=""></el-input>
        </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleClose">取 消</el-button>
            <el-button type="primary" @click="editAddress()">确 定</el-button>
        </span>
        </el-dialog>
        <!--展示物流进度用的对话框-->
        <el-dialog
        title="展示物流进度"
        :visible.sync="dialog2Visible"
        width="60%"
        :before-close="handleClose2">
         <el-timeline :reverse="reverse">
        <el-timeline-item
        v-for="(activity, index) in kuaidi"
        :key="index"
        :timestamp="activity.time">
        {{activity.context}}
        </el-timeline-item>
    </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import citydata from '@/components/orders/citydata'
import kuaidi from './kuaidi'
export default {
  created () {
    this.getOrdersList()
  },
  data () {
    return {
      reqOrdersList: {
        query: '',
        pagenum: 1,
        pagesize: 20
      },
      ordersList: [],
      dialogVisible: false,
      dialog2Visible: false,
      totalpage: 0,
      citydata,
      addressInfo: {
        address: [],
        addressDetail: ''
      },
      addressRules: {
        add1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }],
        add2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      kuaidi,
      reverse: true
    }
  },
  methods: {
    async getOrdersList () {
      const { data: res } = await this.$http.get('orders', { params: this.reqOrdersList })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      console.log(res)
      this.ordersList = res.data.goods
      this.totalpage = res.data.total
    },
    editAdd () {
      this.dialogVisible = true
    },
    addGoods () {},
    editGoodsInfo (id) {
      this.$router.push({ path: '/goods/edit', query: { goods_id: id } })
    },
    async deleteGoodsInfo (id) {
      this.$confirm('此操作将永久删除该条分类信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete('goods/' + id).then(res => {
          if (res.data.meta.status !== 200) return this.$message.error(res.data.meta.msg)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getGoodsList()
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
      this.reqOrdersList.pagesize = val
      this.getOrdersList()
    },
    handleCurrentChange (val) {
      this.reqOrdersList.pagenum = val
      this.getOrdersList()
    },
    handleClose () {
      this.dialogVisible = false
      this.$refs.addressRef.resetFields()
    },
    editAddress () {
      this.$refs.addressRef.validate((valid) => {
        if (!valid) {
          this.$message.error('请按照要求格式输入')
          this.dialogVisible = true
          return
        }
        this.$refs.addressRef.resetFields()
        this.address = []
        this.addressDetail = ''
        this.dialogVisible = false
      })
    },
    async getKuaidi (id) {
    //   const { data: res } = await this.$http.get('kuaidi/' + id)
    //   if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
    //   this.kuaidi = res.data
      this.dialog2Visible = true
    },
    handleClose2 () {
      this.dialog2Visible = false
    }
  }
}
</script>

<style lang="less" scoped>
.gapbottom {
    margin-bottom: 15px;
}

</style>
