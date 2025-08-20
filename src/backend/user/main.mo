import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";

import TypCommon "../common/type";
import TypUser "type";

import SvcUser "service";

persistent actor {
    private var stableUser  : [SvcUser.StableUsers] = [];

    transient let user = SvcUser.User(stableUser);

    // MARK: Login
    public shared ({caller}) func loginUser() : async Result.Result<TypUser.UserResponse, Text> {
        switch(user.users.get(caller)) {
            case(null) { return #err("Akun tidak ditemukan."); };
            case(?u)   { 
                return #ok(user.mappedToResponse(u)); 
            };
        };
    };

    // MARK: Register
    public shared ({caller}) func registerUser(
        req : TypUser.UserRequest
    ) : async Result.Result<TypUser.UserResponse, Text> {
        switch(user.users.get(caller)) {
            case(?_) { return #err("Akun [" # req.firstName # " ] sudah terdaftar."); };
            case(null) { 
                let result = user.updateorCreateUser(caller, req);
                return #ok(user.mappedToResponse(result)); 
            };
        };
    };

    // MARK: Get list of user
    // 
    // List users according on same referrer code
    public shared ({caller}) func getUsers() : async Result.Result<[TypUser.UserResponse], ()> {
        let users  = user.getUsers(caller);
        let result = Buffer.Buffer<TypUser.UserResponse>(0);

        for(u in users.vals()) {
            result.add(user.mappedToResponse(u))
        };

        return #ok(Buffer.toArray(result));
    };

    // MARK: Get filtered users
    public shared ({caller}) func getFilteredUsers(
        filter : TypUser.UserFilter
    ) : async Result.Result<[TypUser.UserResponse], ()> {
        let data = Array.map<TypUser.User, TypUser.UserResponse>(
            user.getFilteredUsers(caller, filter), 
            func u = user.mappedToResponse(u),
        );

        return #ok(data);
    };

    // MARK: Get users by id
    public query func getUsersByIds(
        userIds : [TypCommon.UserId]
    ) : async Result.Result<[TypUser.UserResponse], ()> {
        let data = Array.map<TypUser.User, TypUser.UserResponse>(
            user.getUsersByIds(userIds), 
            func u = user.mappedToResponse(u),
        );

        return #ok(data);
    };

    // MARK: Find user by id
    public shared func findUserById(
        userId : TypCommon.UserId
    ) : async Result.Result<TypUser.UserResponse, Text> {
        return switch(user.findUserById(userId)) {
            case(null) { #err("Akun tidak ditemukan."); };
            case(?u)   { #ok(user.mappedToResponse(u)); };
        };
    };

    // MARK: Update user
    public shared ({caller}) func updateUser(
        req    : TypUser.UserRequest,
    ) : async Result.Result<TypUser.UserResponse, Text> {
        return switch(user.findUserById(caller)) {
            case(null) { #err("Akun tidak ditemukan."); };
            case(?u)   { 
                let data = user.updateorCreateUser(caller, req);
                #ok(user.mappedToResponse(data)); 
            };
        };
    };

    // MARK: Cek principal
    public shared ({caller}) func checkPrincipal() : async Principal {
        return caller;
    };

    system func preupgrade() {
        stableUser         := Iter.toArray(user.users.entries());
    };
    system func postupgrade() {
        stableUser         := [];
    };
};
