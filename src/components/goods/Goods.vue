<template>
    <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="box-card">
        <el-row :gutter="20" class="gapbottom">
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="reqGoodsList.query" class="input-with-select" clearable>
                <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="goAddPage">添加商品</el-button>
            </el-col>
        </el-row>
        <el-table class="gapbottom" :data="goodsList" border style="width: 100%" stripe>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column prop="goods_name" label="商品名称">
            </el-table-column>
            <el-table-column prop="goods_price" width="50px" label="商品价格(元)">
            </el-table-column>
            <el-table-column prop="goods_weight" width="50px" label="商品重量">
            </el-table-column>
            <el-table-column prop="add_time" width="100px" label="创建时间">
                <template slot-scope="scope">
                    {{scope.row.add_time | dateFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="130px">
            <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoodsInfo(scope.row.goods_id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoodsInfo(scope.row.goods_id)"></el-button>
            </el-tooltip>
            </template>
            </el-table-column>
        </el-table>
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.reqGoodsList.pagenum"
        :page-sizes="[20, 50, 100 ,500]"
        :page-size="20"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.totalpage">
        </el-pagination>
    </el-card>
    </div>
</template>

<script>
export default {
  created () {
    this.getGoodsList()
  },
  data () {
    return {
      reqGoodsList: {
        query: '',
        pagenum: 1,
        pagesize: 20
      },
      goodsList: [],
      dialogVisible: false,
      totalpage: 0
    }
  },
  methods: {
    async queryInfo () {
      console.log('query')
    },
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.reqGoodsList })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goodsList = res.data.goods
      this.totalpage = res.data.total
    },
    goAddPage () {
      this.$router.push('/goods/add')
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
    handleSizeChange () {},
    handleCurrentChange () {},
    handleClose () {}
  }
}
</script>

<style lang="less" scoped>
.gapbottom {
    margin-bottom: 15px;
}

</style>
