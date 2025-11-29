import React from 'react'
import { Table } from 'antd';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN'; // Tiếng Việt
const DataTable = ({ columns, dataSource, totalText, loading, rowKey = "id" }) => {
    return (
        <div className="p-6">
            <ConfigProvider locale={viVN}>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    loading={loading}
                    rowKey={rowKey}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} ${totalText}`,
                    }}
                    scroll={{ x: 1200 }}
                    className="border border-gray-200 rounded-lg"
                />

            </ConfigProvider>
        </div>
    )
}

export default DataTable
