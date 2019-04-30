/// <reference path="../serendip.d.ts" />

async (data, model) => {

    const entityCollection = await modules.sbc.db.collection('Entities', false);

    const businessesCollection = await modules.sbc.db.collection('Businesses', false);

    const businesses = await businessesCollection.find({
        $or: [
            {
                members: { $elemMatch: { userId: req.user._id } }
            },
            {
                members: {
                    $elemMatch: {
                        mobile: req.user.mobile,
                        mobileCountryCode: req.user.mobileCountryCode
                    }
                }
            },
            {
                owner: req.user._id
            }
        ]
    })

    

    return {
        model: {
            entityTypes: await entityCollection.find({ _entity: '_entity', _business: { $in: businesses.map(p => p._id) } }),
            entityCount: await entityCollection.count({ _business: { $in: businesses.map(p => p._id) } }),
            businesses,
            user: {
                registerDate: modules.moment(req.user.registeredAt).fromNow()
            }
        }
    };

};
