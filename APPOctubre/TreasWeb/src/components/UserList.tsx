import React from 'react';
import UserCard from './UserCard';

const UserList: React.FC<{ title: string, users: any[] }> = ({ title, users }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <div className="flex flex-wrap -mx-2">
            {users.map((user, index) => (
                <div key={index} className="w-full sm:w-1/2 lg:w-1/3 p-2">
                    <UserCard user={user} />
                </div>
            ))}
        </div>
    </div>
    
    );
};

export default UserList;
