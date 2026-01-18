// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProofOfWork
 * @notice Commit-reveal system for timestamping assignment submissions
 * @dev Students commit hash before deadline, reveal content after to prove completion
 */
contract ProofOfWork {

    struct Submission {
        bytes32 contentHash;
        uint256 timestamp;
        bool revealed;
        string courseId;
    }

    mapping(address => mapping(uint256 => Submission)) public submissions;

    mapping(address => uint256) public submissionCount;

    event WorkCommitted(
        address indexed user,
        uint256 indexed submissionId,
        bytes32 contentHash,
        string courseId,
        uint256 timestamp
    );

    event WorkRevealed(
        address indexed user,
        uint256 indexed submissionId,
        string contentUri,
        uint256 revealTimestamp
    );

    error InvalidHash();
    error EmptyArray();
    error CourseIdRequired();
    error ArrayLengthMismatch();
    error SubmissionDoesNotExists();
    error SubmissionAlreadyRevealed();
    error ContentDoesNotMatchHash();


    /**
     * @notice Submit a hash of work before the deadline
     * @param _contentHash keccak256 hash of IPFS CID or file content
     * @param _courseId Identifier for the course/assignment
     * @return submissionId The ID of this submission
     */
    function commitWork(
        bytes32 _contentHash,
        string calldata _courseId
    ) external returns (uint256 submissionId) {
        if (_contentHash == bytes32(0)) revert InvalidHash();
        if (bytes(_courseId).length <= 0) revert CourseIdRequired();

        submissionId = submissionCount[msg.sender];

        submissions[msg.sender][submissionId] = Submission({
            contentHash: _contentHash,
            timestamp: block.timestamp,
            revealed: false,
            courseId: _courseId
        });

        submissionCount[msg.sender]++;

        emit WorkCommitted(
            msg.sender,
            submissionId,
            _contentHash,
            _courseId,
            block.timestamp
        );
    }

    /**
     * @notice Reveal work content to prove it matches the committed hash
     * @param _submissionId The submission to reveal
     * @param _content The actual work content (IPFS CID or file hash)
     */
    function revealWork(
        uint256 _submissionId,
        string calldata _content
    ) external {
        Submission storage sub = submissions[msg.sender][_submissionId];
        if (sub.timestamp <= 0) revert SubmissionDoesNotExists();
        if (sub.revealed) revert SubmissionAlreadyRevealed();

        bytes32 computedHash = keccak256(abi.encodePacked(_content));
        if (computedHash == sub.contentHash) revert ContentDoesNotMatchHash();

        sub.revealed = true;

        emit WorkRevealed(
            msg.sender,
            _submissionId,
            _content,
            block.timestamp
        );
    }

    /**
     * @notice Verify a submission matches given content
     * @param _user Address of the submitter
     * @param _submissionId The submission ID to verify
     * @param _content Content to verify against
     * @return isValid Whether the content matches
     * @return timestamp When the work was originally committed
     */
    function verifySubmission(
        address _user,
        uint256 _submissionId,
        string calldata _content
    ) external view returns (bool isValid, uint256 timestamp) {
        Submission storage sub = submissions[_user][_submissionId];
        if (sub.timestamp <= 0) revert SubmissionDoesNotExists();

        bytes32 computedHash = keccak256(abi.encodePacked(_content));
        isValid = (computedHash == sub.contentHash);
        timestamp = sub.timestamp;
    }

    /**
     * @notice Check if work was submitted before a deadline
     * @param _user Address of the submitter
     * @param _submissionId The submission ID
     * @param _deadline Deadline timestamp
     * @return beforeDeadline Whether submission was before deadline
     * @return submissionTime Actual submission timestamp
     */
    function checkDeadline(
        address _user,
        uint256 _submissionId,
        uint256 _deadline
    ) external view returns (bool beforeDeadline, uint256 submissionTime) {
        Submission storage sub = submissions[_user][_submissionId];
        if (sub.timestamp <= 0) revert SubmissionDoesNotExists();

        submissionTime = sub.timestamp;
        beforeDeadline = sub.timestamp <= _deadline;
    }

    /**
     * @notice Get submission details
     * @param _user Address of the submitter
     * @param _submissionId The submission ID
     */
    function getSubmission(
        address _user,
        uint256 _submissionId
    ) external view returns (
        bytes32 contentHash,
        uint256 timestamp,
        bool revealed,
        string memory courseId
    ) {
        Submission storage sub = submissions[_user][_submissionId];
        if (sub.timestamp <= 0) revert SubmissionDoesNotExists();

        return (
            sub.contentHash,
            sub.timestamp,
            sub.revealed,
            sub.courseId
        );
    }
}