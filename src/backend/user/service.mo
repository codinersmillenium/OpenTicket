import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

import TypCommon "../common/type";
import TypUser "type";

import UtlDate "../utils/date";

module {
    public type StableUsers         = (TypCommon.UserId, TypUser.User);

    public class User(
        dataUsers         : [StableUsers]
    ) {
        public let users         = HashMap.HashMap<TypCommon.UserId, TypUser.User>(dataUsers.size(), Principal.equal, Principal.hash);

        // MARK: Get user by ids
        public func getUsersByIds(userIds : [TypCommon.UserId]) : [TypUser.User] {
            let result = Buffer.Buffer<TypUser.User>(userIds.size());
            for (userId in userIds.vals()) {
                switch(users.get(userId)) {
                    case(null)  {};
                    case(?user) { result.add(user); };
                };
            };
            return Buffer.toArray(result);
        };

        // MARK: Get users
        public func getUsers(userId : TypCommon.UserId) : [TypUser.User] {
            return Iter.toArray(users.vals())
        };

        // MARK: Get filtered users
        public func getFilteredUsers(
            userId : TypCommon.UserId,
            filter : TypUser.UserFilter,
        ) : [TypUser.User] {
            let result    = Buffer.Buffer<TypUser.User>(0);
            
            label loopUser for(user in users.vals()) {
                let inRole = Array.find<TypUser.Role>(
                    filter.roles, 
                    func(role) = role == user.role
                ) != null;

                if (not inRole) {
                    continue loopUser;
                };
            };

            return Buffer.toArray(result);
        };

        // MARK: Create user
        public func updateorCreateUser(
            userId       : TypCommon.UserId, 
            req          : TypUser.UserRequest
        ) : TypUser.User {
            let data : TypUser.User = {
                id              = userId;
                userName        = req.userName;
                firstName       = req.firstName;
                lastName        = req.lastName;
                role            = req.role;
                createdAt       = UtlDate.now();
                createdById     = userId;
                updatedAt       = null;
                updatedById     = null;
            };

            users.put(data.id, data);
            return data;
        };

        // MARK: Find user by id
        public func findUserById(id : TypCommon.UserId) : ?TypUser.User {
            switch (users.get(id)) {
                case (null)  { return null; };
                case (?user) {
                    let data : TypUser.User = {
                        id 		        = user.id;
                        userName        = user.userName;
                        firstName       = user.firstName;
                        lastName        = user.lastName;
                        role 	        = user.role;
                        createdAt       = user.createdAt;
                        createdById     = user.createdById;
                        updatedAt       = user.updatedAt;
                        updatedById     = user.updatedById;
                    };

                    return ?data;
                };
            };
        };

        // MARK: Mapped to data response
        public func mappedToResponse(user  : TypUser.User) : TypUser.UserResponse {
            let data : TypUser.UserResponse = {
                id              = user.id;
                userName        = user.userName;
                firstName       = user.firstName;
                lastName        = user.lastName;
                role            = user.role;
                createdAt       = user.createdAt; 
            };

            return data;
        };
    }
}