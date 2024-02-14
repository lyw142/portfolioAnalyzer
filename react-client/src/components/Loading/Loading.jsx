import React from "react";
import { Layout, Spin } from "antd";
import { Content } from "antd/es/layout/layout";
import { LoadingOutlined } from "@ant-design/icons";

const Loading = ({ height }) => {
    return (
        <Layout
            style={{
                minHeight: '25vh',
                height: height ? height : '100%',
                background: 'transparent'
            }}>
            <Content
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Spin indicator={<LoadingOutlined spin />} />
            </Content>
        </Layout>
    );
};

export default Loading;