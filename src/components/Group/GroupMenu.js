import React from 'react'
import { Dropdown } from "flowbite-react";
import { Link } from 'react-router-dom';
import { AiOutlineUserDelete } from "react-icons/ai";
import { GrUserAdmin } from "react-icons/gr";
import { useDispatch, useSelector } from 'react-redux';
import { doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useState } from 'react';
import { useEffect } from 'react';
import { groupUsers } from '../../redux/userSlice';

function GroupMenu({ userid }) {

    const chatId = useSelector(state => state.users.chatId)

    const [users, setUsers] = useState([])
    const [managers, setManagers] = useState(false)
    const dispatch = useDispatch()
    const selectUser = useSelector(state => state.users.selectUser)
    const tempArray = users

    const isManager = [managers].findIndex((item) => item[auth.currentUser.uid] === auth.currentUser.uid) >= 0;

    const isUser = users.findIndex((item) => item.uid === auth.currentUser.uid) >= 0;

    useEffect(() => {
        const getUsers = () => {

            const response = onSnapshot(doc(db, "userChats", auth.currentUser.uid), (doc) => {
                doc.exists() && setUsers(doc.data()[chatId].groupPrew)
            })
            return () => {
                response()
            }
        }

        const getManagers = () => {

            const response = onSnapshot(doc(db, "groups", chatId), (doc) => {
                doc.exists() && setManagers(doc.data())
            })
            return () => {
                response()
            }
        }
        chatId && getUsers() && getManagers()

    }, [chatId])

    const handleUsersDelete = async () => {

        const filter = tempArray.findIndex((item) => item.uid === userid)
        tempArray.splice(filter, 1);
        for (let index = 0; index < users.length; index++) {
            await updateDoc(doc(db, "userChats", users[index].uid), {
                [chatId]: {
                    id: chatId,
                    date: serverTimestamp(),
                    groupPrew: tempArray,
                },
                [chatId + ".userInfo"]: {
                    user: {
                        description: selectUser.description,
                        name: selectUser.name,
                        photoURL: selectUser.photoURL,
                        id: selectUser.id,
                        type: "group",
                    }
                },
                [chatId + ".lastMessage"]: {
                    text: "Grup Changes",
                },
            });
        }
        await updateDoc(doc(db, "userChats", userid), {
            [chatId]: {
                id: chatId,
                date: serverTimestamp(),
                groupPrew: tempArray,
            },
            [chatId + ".userInfo"]: {
                user: {
                    description: selectUser.description,
                    name: selectUser.name,
                    photoURL: selectUser.photoURL,
                    id: selectUser.id,
                    type: "group",
                }
            },
            [chatId + ".lastMessage"]: {
                text: "Grup Changes",
            },
        });

        await updateDoc(doc(db, "chats", chatId), {
            [userid]: true,
            [userid + "deletedDate"]: serverTimestamp(),
        });

        dispatch(groupUsers(tempArray))
    }

    const handleAddAdmin = async () => {
        await updateDoc(doc(db, "groups", chatId), {
            [userid]: userid,
        });
    }

    return (
        <div>
            <Dropdown
                arrowIcon={true}
                inline={true}
            >
                {
                    users.map((item, key) => (
                        isManager && item.uid === auth.currentUser.uid &&
                        <Link key={key} onClick={() => { handleAddAdmin() }} className="w-full">
                            <Dropdown.Item>
                                <GrUserAdmin className="h-5 w-5 mr-2 hover:bg-white hover:text-black hover:rounded-2xl hover:cursor-pointer" />
                                Add Admin
                            </Dropdown.Item>
                        </Link>

                    ))

                }
                {isUser &&
                    <Link onClick={() => handleUsersDelete()} className="w-full">
                        <Dropdown.Item>
                            <AiOutlineUserDelete className="h-5 w-5 mr-2 hover:bg-white hover:text-black hover:rounded-2xl hover:cursor-pointer" />
                            Remove from Group
                        </Dropdown.Item>
                    </Link>
                }



            </Dropdown >
        </div >)
}

export default GroupMenu