import TypCommon "../common/type";

module {
    public type Role = {
        #seller;
        #buyer;
    };

    public type User = {
		id              : TypCommon.UserId;
        userName        : Text;
		firstName       : Text;
		lastName        : Text;
		role            : Role;
		createdAt       : Int;
		createdById     : TypCommon.UserId;
		updatedAt       : ?Int;
		updatedById     : ?TypCommon.UserId;
		// TODO: Profile image
    };

    public type UserFilter = {
        roles : [Role];
	};

    public type UserRequest = {
        userName     : Text;
        firstName    : Text;
		lastName     : Text;
		role         : Role;
	};

	public type UserResponse = {
		id              : TypCommon.UserId;
        userName        : Text;
		firstName       : Text;
		lastName        : Text;
		role            : Role;
		createdAt       : Int;
		// TODO: Profile image
    };

};