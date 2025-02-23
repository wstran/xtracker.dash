import { useSession } from "next-auth/react";
import {useEffect, useState} from "react";
import io, { Socket } from 'socket.io-client';
import {Col, Empty, Flex, InputNumberProps, message, Progress, Row, Statistic} from 'antd';
import { InputNumber, Button } from 'antd';
import axios from "axios";

const onChange: InputNumberProps['onChange'] = (value) => {
    console.log('changed', value);
};

let socket: Socket;

const Index = () => {
    const { data: session, status } = useSession();
    const [cms, setCms] = useState<{
        "deep_thread_workers"?: number,
        "main_thread_workers_5K"?: number,
        "main_thread_workers_100K"?: number,
        "main_thread_workers_500K"?: number,
        "tags_thread_workers"?: number,
        "scan_thread_workers"?: number
    }>({});
    const [crawlers, setCrawlers] = useState<[string, {
        total_workers: number,
        deep_workers: number,
        main_workers_5K: number,
        main_workers_100K: number,
        main_workers_500K: number,
        scan_workers: number,
        tags_workers: number,
        os: {
            cpu_cores: number,
            total_men: number,
            free_men: number,
            used_men: number,
            platform: string,
            release: string,
            type: string,
            uptime: number
        },
        update_at: Date
    }][]>([]);

    const socketInitializer = async () => {
        await fetch('/api/worker/connect');

        socket = io();

        socket.on('message', (msg: any) => {
            setCrawlers(JSON.parse(msg));
        });

        socket.on('connect', () => {
            console.log('connected')
        })
    }

    useEffect(() => {
        if (session && (session as any).user?.role !== "subscriber") {
            socketInitializer().catch(console.error);

            axios.get('/api/worker/get')
                .then(res => setCms(res.data))
                .catch(console.error);
        }
    }, []);

    const [messageApi, contextHolder] = message.useMessage();

    return (
        <>
            {contextHolder}
            {session && (session as any).user?.role === "subscriber" ? (
                <div className="relative flex items-center rounded border border-danger bg-danger-light p-3.5 text-danger before:absolute before:top-1/2 before:-mt-2 before:inline-block before:border-b-8 before:border-r-8 before:border-t-8 before:border-b-transparent before:border-r-inherit before:border-t-transparent ltr:border-r-[64px] ltr:before:right-0 rtl:border-l-[64px] rtl:before:left-0 rtl:before:rotate-180 dark:bg-danger-dark-light">
                      <span className="absolute inset-y-0 m-auto h-6 w-6 text-white ltr:-right-11 rtl:-left-11">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                              opacity="0.5"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="1.5"
                          />
                          <path d="M12 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <circle cx="12" cy="16" r="1" fill="currentColor" />
                        </svg>
                      </span>
                    <span className="ltr:pr-2 rtl:pl-2">
                        <strong className="ltr:mr-1 rtl:ml-1">Warning!</strong>You don't have access to this page.
                    </span>
                    <button type="button" className="hover:opacity-80 ltr:ml-auto rtl:mr-auto">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="panel space-y-4 w-full">
                        <Button type="primary" onClick={() => {
                            axios.post('/api/worker/update', { cms })
                                .then(res => message.success('Update CMS Successfully'))
                                .catch(console.error);
                        }}>Update</Button>
                        <div className="flex space-x-4 justify-center">
                            <div className="flex flex-col items-center">
                                <label>Deep Crawl Workers</label>
                                <InputNumber size="large" className="w-[200px]" min={0} max={1000} value={cms?.deep_thread_workers || 0} onChange={e => setCms(prev => ({ ...prev, deep_thread_workers: e || 0 }))} />
                            </div>
                            <div className="flex flex-col items-center">
                                <label>5K Followers Crawl Workers</label>
                                <InputNumber size="large" className="w-[200px]" min={0} max={1000} value={cms?.main_thread_workers_5K || 0} onChange={e => setCms(prev => ({ ...prev, main_thread_workers_5K: e || 0 }))} />
                            </div>
                            <div className="flex flex-col items-center">
                                <label>100K Followers Crawl Workers</label>
                                <InputNumber size="large" className="w-[200px]" min={0} max={1000} value={cms?.main_thread_workers_100K || 0} onChange={e => setCms(prev => ({ ...prev, main_thread_workers_100K: e || 0 }))} />
                            </div>
                            <div className="flex flex-col items-center">
                                <label>500K Followers Crawl Workers</label>
                                <InputNumber size="large" className="w-[200px]" min={0} max={1000} value={cms?.main_thread_workers_500K || 0} onChange={e => setCms(prev => ({ ...prev, main_thread_workers_500K: e || 0 }))} />
                            </div>
                            <div className="flex flex-col items-center">
                                <label>Tags Crawl Workers</label>
                                <InputNumber size="large" className="w-[200px]" min={0} max={1000} value={cms?.tags_thread_workers || 0} onChange={e => setCms(prev => ({ ...prev, tags_thread_workers: e || 0 }))} />
                            </div>
                            <div className="flex flex-col items-center">
                                <label>Scan Crawl Workers</label>
                                <InputNumber size="large" className="w-[200px]" min={0} max={1000} value={cms?.scan_thread_workers || 0} onChange={e => setCms(prev => ({ ...prev, scan_thread_workers: e || 0 }))} />
                            </div>
                        </div>
                    </div>
                    <div className='panel w-full space-y-4'>
                        {crawlers.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
                        {crawlers.map(([crawler_id, crawler], i) => (
                            <div className="panel space-y-4" key={i}>
                                <label className="text-xl">Worker ID: {crawler_id}</label>
                                <Row gutter={2}>
                                    <Col span={2}>
                                        <Statistic title="CPU" value={crawler.os.cpu_cores} />
                                    </Col>
                                    <Col span={2}>
                                        <Statistic title="Type" value={crawler.os.type} />
                                    </Col>
                                    <Col span={2}>
                                        <Statistic title="Platform" value={crawler.os.platform} />
                                    </Col>
                                    <Col span={2}>
                                        <Statistic title="Release" value={crawler.os.release} />
                                    </Col>
                                    <Col span={2}>
                                        <Statistic title="Uptime" value={crawler.os.uptime} />
                                    </Col>
                                </Row>
                                <Flex vertical>
                                    <Col span={10}>
                                        <Statistic title="RAM Used" value={crawler.os.used_men + " GB"} suffix={"/ " + crawler.os.total_men + "GB"} />
                                    </Col>
                                    <Progress percent={Math.floor(crawler.os.used_men / crawler.os.total_men * 100)} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
                                </Flex>
                                <Row gutter={2}>
                                    <Col span={3}>
                                        <Statistic title="Deep Workers" value={crawler.deep_workers} />
                                    </Col>
                                    <Col span={3}>
                                        <Statistic title="5K Followers Workers" value={crawler.main_workers_5K} />
                                    </Col>
                                    <Col span={3}>
                                        <Statistic title="100K Followers Workers" value={crawler.main_workers_100K} />
                                    </Col>
                                    <Col span={3}>
                                        <Statistic title="500K Followers Workers" value={crawler.main_workers_500K} />
                                    </Col>
                                    <Col span={3}>
                                        <Statistic title="Tags Workers" value={crawler.tags_workers} />
                                    </Col>
                                    <Col span={3}>
                                        <Statistic title="Scan Workers" value={crawler.scan_workers} />
                                    </Col>
                                </Row>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default Index;