export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export const CONTRACT_ABI = [
    {
        "type": "function",
        "name": "checkDeadline",
        "inputs": [
            { "name": "user", "type": "address" },
            { "name": "courseId", "type": "uint256" },
            { "name": "deadline", "type": "uint256" }
        ],
        "outputs": [
            { "name": "", "type": "bool" },
            { "name": "", "type": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "commitWork",
        "inputs": [
            { "name": "hash", "type": "bytes32" },
            { "name": "data", "type": "string" }
        ],
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getSubmission",
        "inputs": [
            { "name": "user", "type": "address" },
            { "name": "index", "type": "uint256" }
        ],
        "outputs": [
            { "name": "", "type": "bytes32" },
            { "name": "", "type": "uint256" },
            { "name": "", "type": "bool" },
            { "name": "", "type": "string" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "revealWork",
        "inputs": [
            { "name": "index", "type": "uint256" },
            { "name": "content", "type": "string" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "submissionCount",
        "inputs": [{ "name": "user", "type": "address" }],
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "submissions",
        "inputs": [
            { "name": "", "type": "address" },
            { "name": "", "type": "uint256" }
        ],
        "outputs": [
            { "name": "workHash", "type": "bytes32" },
            { "name": "timestamp", "type": "uint256" },
            { "name": "revealed", "type": "bool" },
            { "name": "content", "type": "string" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "verifySubmission",
        "inputs": [
            { "name": "user", "type": "address" },
            { "name": "index", "type": "uint256" },
            { "name": "content", "type": "string" }
        ],
        "outputs": [
            { "name": "", "type": "bool" },
            { "name": "", "type": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "WorkCommitted",
        "inputs": [
            { "name": "user", "type": "address", "indexed": false },
            { "name": "index", "type": "uint256", "indexed": false },
            { "name": "hash", "type": "bytes32", "indexed": false },
            { "name": "data", "type": "string", "indexed": false },
            { "name": "timestamp", "type": "uint256", "indexed": false }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "WorkRevealed",
        "inputs": [
            { "name": "user", "type": "address", "indexed": false },
            { "name": "index", "type": "uint256", "indexed": false },
            { "name": "content", "type": "string", "indexed": false },
            { "name": "timestamp", "type": "uint256", "indexed": false }
        ],
        "anonymous": false
    },
    { "type": "error", "name": "ArrayLengthMismatch", "inputs": [] },
    { "type": "error", "name": "ContentDoesNotMatchHash", "inputs": [] },
    { "type": "error", "name": "CourseIdRequired", "inputs": [] },
    { "type": "error", "name": "EmptyArray", "inputs": [] },
    { "type": "error", "name": "InvalidHash", "inputs": [] },
    { "type": "error", "name": "SubmissionAlreadyRevealed", "inputs": [] },
    { "type": "error", "name": "SubmissionDoesNotExists", "inputs": [] }
]