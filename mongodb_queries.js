
// Select database
use("voter_management");

// 1. CREATE: Insert multiple sample documents
db.voters.insertMany([
    {
        voter_id: "DEMO101",
        name: "Rahul Sharma",
        age: 25,
        gender: "Male",
        state: "Punjab",
        constituency: "Jalandhar"
    },
    {
        voter_id: "DEMO102",
        name: "Priya Verma",
        age: 23,
        gender: "Female",
        state: "Punjab",
        constituency: "Amritsar"
    },
    {
        voter_id: "DEMO103",
        name: "Aman Singh",
        age: 28,
        gender: "Male",
        state: "Haryana",
        constituency: "Gurugram"
    }
]);

// 2. READ: Display all voters
db.voters.find();

// 3. READ: Find one voter
db.voters.findOne({ voter_id: "DEMO101" });

// 4. FILTER: Find Punjab voters
db.voters.find({ state: "Punjab" });

// 5. UPDATE: Update voter age
db.voters.updateOne(
    { voter_id: "DEMO101" },
    { $set: { age: 26 } }
);

// 6. DELETE: Delete a demo voter
db.voters.deleteOne({ voter_id: "DEMO103" });

// 7. SORT: Sort by age
db.voters.find().sort({ age: -1 });

// 8. COUNT: Count voters
db.voters.countDocuments({});

// 9. AGGREGATION: Count voters by state
db.voters.aggregate([
    {
        $group: {
            _id: "$state",
            total_voters: { $sum: 1 }
        }
    },
    {
        $sort: { total_voters: -1 }
    }
]);

// 10. INDEXING
db.voters.createIndex(
    { state: 1 }
);

// 11. VIEW INDEXES
db.voters.getIndexes();
