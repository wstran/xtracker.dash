import { useSession } from "next-auth/react";
import React, {useEffect, useMemo, useRef, useState} from "react";
import axios from "axios";
import {DataTable, DataTableSortStatus} from "mantine-datatable";
import {message, Modal} from 'antd';
import { Button, Dropdown, Space, Input } from 'antd';
import {SearchOutlined, UserAddOutlined, UserOutlined} from "@ant-design/icons";

type Influencer = {
    username: string,
    avatar_url?: string,
    background_url?: string,
    description?: string,
    followers_count?: number,
    following_count?: number,
    joined_at?: string,
    name?: string,
    subscriptions_count?: number,
    tweets_count?: number,
    updated_at?: string,
    verified?: boolean
};

const TimeAgo = ({ date }: { date: Date }) => {
    const [timeAgo, setTimeAgo] = useState(() => calculateTimeDifference(date, new Date()));

    useEffect(() => {
        setTimeAgo(calculateTimeDifference(date, new Date()));
        const intervalId = setInterval(() => {
            setTimeAgo(calculateTimeDifference(date, new Date()));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [date]);

    function calculateTimeDifference(date1: Date, date2: Date) {
        const timeDifferenceInMs = date2.getTime() - date1.getTime();

        const seconds = Math.floor(timeDifferenceInMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return days === 1 ? `${days} day ago` : `${days} days ago`;
        }
        if (hours > 0) {
            return hours === 1 ? `${hours} hour ago` : `${hours} hours ago`;
        }
        if (minutes > 0) {
            return minutes === 1 ? `${minutes} minute ago` : `${minutes} minutes ago`;
        }
        if (seconds > 0) {
            return seconds === 1 ? `${seconds} second ago` : `${seconds} seconds ago`;
        }
        return "just now";
    }

    return <span>{timeAgo}</span>;
}

const Index = () => {
    const { data: session, status } = useSession();
    const [influencers, setInfluencers] = useState<Influencer[]>([])
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [recordsData, setRecordsData] = useState(influencers);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: "updated_at",
        direction: "asc",
    });

    useEffect(() => {
        if (status ==='authenticated') {
         axios.get('/api/influencer/get')
             .then(res => setInfluencers(res.data))
             .catch(console.error);
        }
    }, [status]);

    useEffect(() => {
        const records = [...influencers];

        records.sort((a: { [key: string]: any }, b: { [key: string]: any }) => {

            if (sortStatus.columnAccessor === 'updated_at') {
                return new Date(a[sortStatus.columnAccessor]?.updated_at || 0).getTime() - new Date(b[sortStatus.columnAccessor]?.updated_at || 0).getTime();
            }

            return (a[sortStatus.columnAccessor] || 0) - (b[sortStatus.columnAccessor] || 0);
        });

        setInfluencers(sortStatus.direction === 'desc' ? records.reverse() : records);

        setPage(1);
    }, [sortStatus]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...influencers.slice(from, to)]);
    }, [page, pageSize, influencers]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return recordsData;

        const result: Influencer[] = [];

        [
            ...influencers.filter((user: any) => {
                return user.username?.toLowerCase().includes(searchTerm.toLowerCase());
            }).slice(0, pageSize),
            ...influencers.filter((user: any) => {
                return user.name?.toLowerCase().includes(searchTerm.toLowerCase());
            }).slice(0, pageSize)
        ].forEach(i => result.findIndex(a => a.username.toLowerCase() === i.username.toLowerCase()) === -1 && result.push(i));

        return result;
    }, [recordsData, searchTerm, influencers]);

    const [messageApi, contextHolder] = message.useMessage();

    const inputRef = useRef('');

    const showPromiseConfirm = () => {
        const Content = () => {
            const [input, setInput] = useState('');

            return (
                <Input
                    size="large"
                    placeholder="Input username"
                    value={input}
                    prefix={<UserOutlined />}
                    onChange={e => {
                        setInput(e.target.value);
                        inputRef.current = e.target.value;
                    }}
                />
            );
        };

        Modal.confirm({
            title: "Input influencer's username",
            icon: <UserAddOutlined />,
            content: <Content />,
            onOk() {
                const username = inputRef.current.toLowerCase();

                return new Promise((resolve, reject) => {
                    setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
                    axios.post(`/api/influencer/upsert`, { username })
                        .then(() => {
                            setInfluencers(prev => [...prev, { username }]);
                            messageApi.success("Successfully added influencer");
                        })
                        .catch(reject)
                        .finally(() => {
                            resolve(1);
                        });
                }).catch(console.error);
            },
            onCancel() {},
        });
    };

    return (
        <>
            {contextHolder}
            {session && (session as any).user?.role === "subscriber" && (
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
            )}
            {session && (session as any).user?.role !== "subscriber" && (
                <div className="panel">
                    <div className="flex items-center justify-between pb-4">
                        <Space.Compact size="large">
                            <Input className="!bg-white rounded-lg" addonBefore={<SearchOutlined />} placeholder="Search" size={'large'} onChange={(e) => setSearchTerm(e.target.value)} />
                        </Space.Compact>
                        <Space.Compact size="large">
                            <Button type="primary" icon={<UserAddOutlined />} onClick={showPromiseConfirm}>
                                Add Influencer
                            </Button>
                        </Space.Compact>
                    </div>
                    <div className="datatables">
                        <DataTable
                            noRecordsText=""
                            highlightOnHover
                            className="table-hover whitespace-nowrap"
                            records={filteredUsers}
                            totalRecords={influencers.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) =>
                                `Showing  ${from} to ${to} of ${totalRecords} entries`
                            }
                            columns={[
                                {
                                    accessor: "username",
                                    title: "Username",
                                    titleClassName: "!w-0",
                                    render: (
                                        { username },
                                        index
                                    ) => (
                                        <div key={index} className="hover:cursor-pointer text-primary" onClick={() => {
                                            window.open(`https://x.com/${username}`, '_blank');
                                        }}>
                                            @{username}
                                        </div>
                                    ),
                                },
                                {
                                    accessor: "name",
                                    title: "Name",
                                    titleClassName: "!w-0",
                                    render: (
                                        { name },
                                        index
                                    ) => (
                                        <div key={index}>{name || 'Unknown'}</div>
                                    ),
                                },
                                {
                                    accessor: "updated_at",
                                    title: "Last Update",
                                    titleClassName: "!w-0 !text-center",
                                    sortable: true,
                                    render: (
                                        { updated_at },
                                        index
                                    ) => (
                                        <div key={index} className="text-center">
                                            {updated_at ? <TimeAgo date={new Date(updated_at)}/> : 'Unknown'}
                                        </div>
                                    ),
                                },
                                {
                                    accessor: "",
                                    title: "",
                                    titleClassName: "!w-0 !text-center",
                                    render: (
                                        { username },
                                        index
                                    ) => (
                                        <Dropdown key={index} menu={{
                                            items: [
                                                {
                                                    key: '1',
                                                    label: (
                                                        <div className="text-danger" onClick={() => {
                                                            axios.delete('/api/influencer/remove', { params: { username } })
                                                                .then(async () => {
                                                                    setInfluencers(prev => prev.filter(i => i.username !== username));
                                                                    await messageApi.open({
                                                                        type: 'success',
                                                                        content: 'The influencer has been deleted',
                                                                    });
                                                                })
                                                                .catch(console.error);
                                                        }}>
                                                            Remove
                                                        </div>
                                                    ),
                                                }
                                            ]
                                        }} placement="bottom">
                                            <Button type='primary'>Action</Button>
                                        </Dropdown>
                                    ),
                                },
                            ]}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Index;