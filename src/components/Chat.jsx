// Chat.jsx
import { useState, useEffect, useRef } from "react";
import {
  FiSend,
  FiPlus,
  FiSearch,
  FiSmile,
  FiChevronLeft,
  FiDelete,
} from "react-icons/fi";
import { LS } from "../Utils/Resuse";
import clsx from "clsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Picker from "emoji-picker-react";

const formatTime = (isoString, withDate = false) => {
  if (!isoString) return "";
  let date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return withDate
    ? date.toLocaleString([], { dateStyle: "short", timeStyle: "short" })
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function Chat() {
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [activeChat, setActiveChat] = useState({ id: "", name: "", chatId: "", type: "user" });
  const [contacts, setContacts] = useState([]);
  const [unread, setUnread] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadInput, setThreadInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [reactionsMap, setReactionsMap] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const ws = useRef(null);

  const buildChatId = (a, b) => [a, b].sort().join("_");

  // Fetch contacts
  const loggedIn = LS.get("isloggedin");
  const isManager = LS.get("position"); // "Manager" or other
  const isDepart = LS.get("department"); // "HR" or other
  const userid = LS.get("userid");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8000/get_all_users");
        const data = await res.json();
        const filtered = data.filter((user) => {
          if (user.id === userid) return false;
          if (isManager?.toLowerCase() === "manager") return true;
          if (isDepart?.toLowerCase() === "hr") return user.position?.toLowerCase() === "manager";
          return user.department?.toLowerCase() !== "hr";
        });
        setContacts(filtered);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [userid, isManager, isDepart]);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(`http://localhost:8000/get_user_groups/${userid}`);
        const data = await res.json();
        setGroups(data);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };
    fetchGroups();
  }, [userid]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat, selectedThread]);

  // WebSocket connection
  const openWebSocket = (chatType = "user", chatId = "") => {
    ws.current?.close();
    const url =
      chatType === "group"
        ? `ws://127.0.0.1:8000/ws/group/${chatId}`
        : `ws://127.0.0.1:8000/ws/${userid}`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onerror = (err) => { console.error("WS error", err); setIsConnected(false); };

    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "presence" && Array.isArray(payload.users)) {
          setOnlineUsers(payload.users);
          return;
        }

        if (payload.type === "reaction") {
          setReactionsMap((prev) => {
            const prevMsg = prev[payload.messageId] || {};
            const count = (prevMsg[payload.emoji] || 0) + (payload.delta || 0);
            return { ...prev, [payload.messageId]: { ...prevMsg, [payload.emoji]: Math.max(0, count) } };
          });
          return;
        }

        if (payload.type === "thread") {
          setMessages((prev) => {
            const threadKey = `thread:${payload.rootId}`;
            const arr = prev[threadKey] || [];
            return { ...prev, [threadKey]: [...arr, payload] };
          });
          return;
        }

        const msgChatId =
          payload.chatId ||
          (chatType === "user"
            ? buildChatId(payload.from_user || payload.from, payload.to_user || payload.to)
            : chatId);

        setMessages((prev) => {
          const chatMessages = prev[msgChatId] || [];
          const filtered = chatMessages.filter((m) => m.id !== payload.id && m.id !== payload.tempId);
          return { ...prev, [msgChatId]: [...filtered, payload] };
        });

        if (msgChatId !== activeChat.chatId) {
          setUnread((prev) => ({ ...prev, [msgChatId]: (prev[msgChatId] || 0) + 1 }));
          toast.info(
            `New message from ${payload.from_user || payload.from}: ${payload.text ? payload.text.slice(0, 60) : "File"}`,
            { position: "top-right", autoClose: 4000 }
          );
        }
      } catch (err) {
        console.error("Invalid WS payload:", event.data, err);
      }
    };
  };

  const handleContactClick = async (contact) => {
    try {
      const res = await fetch(`http://localhost:8000/get_EmployeeId/${encodeURIComponent(contact.name)}`);
      const data = await res.json();
      const employeeId = data.Employee_ID || data.employee_id || data.EmployeeId;
      if (!employeeId) return toast.error(`Failed to get employee ID for ${contact.name}`);

      const chatId = buildChatId(userid, employeeId);
      setActiveChat({ id: employeeId, name: contact.name, chatId, type: "user" });
      setUnread((prev) => ({ ...prev, [chatId]: 0 }));
      openWebSocket("user");

      const historyRes = await fetch(`http://localhost:8000/history/${chatId}`);
      if (historyRes.ok) {
        const history = await historyRes.json();
        setMessages((prev) => ({ ...prev, [chatId]: history }));
      }
    } catch (err) {
      console.error("Failed to open chat:", err);
      toast.error("Failed to open chat with this contact.");
    }
  };

  const handleGroupClick = async (group) => {
    setActiveChat({ id: group._id, name: group.name, chatId: group._id, type: "group" });
    setUnread((prev) => ({ ...prev, [group._id]: 0 }));
    openWebSocket("group", group._id);

    try {
      const res = await fetch(`http://localhost:8000/group_history/${group._id}`);
      if (res.ok) {
        const history = await res.json();
        setMessages((prev) => ({ ...prev, [group._id]: history }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveGroup = async (group) => {
    if (!confirm(`Are you sure you want to delete group "${group.name}"?`)) return;
    try {
      const res = await fetch(`http://localhost:8000/delete_group/${group._id}`, { method: "DELETE" });
      if (res.ok) {
        setGroups((prev) => prev.filter((g) => g._id !== group._id));
        toast.success("Group deleted successfully");
      } else toast.error("Failed to delete group");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting group");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const attemptSend = async () => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        setTimeout(attemptSend, 100);
        return;
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const messageData = {
        id: tempId,
        tempId,
        type: "message",
        from_user: userid,
        to_user: activeChat.type === "user" ? activeChat.id : undefined,
        text: newMessage,
        timestamp: new Date().toISOString(),
        chatId: activeChat.chatId,
      };

      setMessages((prev) => {
        const chatMessages = prev[activeChat.chatId] || [];
        return { ...prev, [activeChat.chatId]: [...chatMessages, messageData] };
      });

      ws.current.send(JSON.stringify(messageData));
      setNewMessage("");
    };

    attemptSend();
  };

  const toggleReaction = (messageId, emoji = "👍") => {
    setReactionsMap((prev) => {
      const cur = prev[messageId] || {};
      const curCount = cur[emoji] || 0;
      const nextCount = curCount > 0 ? curCount - 1 : 1;
      return { ...prev, [messageId]: { ...cur, [emoji]: nextCount } };
    });

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "reaction", messageId, emoji, user: userid }));
    }
  };

  const sendThreadMessage = async () => {
    if (!selectedThread || !threadInput.trim()) return;

    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      toast.error("Socket not connected");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const targetUser =
      selectedThread.from_user === userid
        ? selectedThread.to_user
        : selectedThread.from_user;

    const payload = {
      type: "thread",
      id: tempId,
      tempId,
      from_user: userid,
      to_user: targetUser,
      text: threadInput.trim(),
      rootId: selectedThread.id,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const key = `thread:${payload.rootId}`;
      const arr = prev[key] || [];
      const exists = arr.some((m) => m.tempId === tempId);
      if (exists) return prev;
      return { ...prev, [key]: [...arr, payload] };
    });

    ws.current.send(JSON.stringify(payload));

    try {
      await fetch("http://localhost:8000/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error(err);
      toast.error("Error saving thread message");
    }

    setThreadInput("");
  };

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0] || "").join("").toUpperCase();

  const activeMessages = Array.isArray(messages[activeChat.chatId])
    ? messages[activeChat.chatId].filter((m) =>
        m.text ? m.text.toLowerCase().includes(searchTerm.toLowerCase()) : true
      )
    : [];

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group creation handler
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) {
      toast.error("Enter group name and select at least 2 members");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/create_group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName, members: [userid, ...selectedUsers] }),
      });
      if (res.ok) {
        toast.success("Group created successfully");
        setShowGroupModal(false);
        setGroupName("");
        setSelectedUsers([]);
        // Refresh groups
        const groupRes = await fetch(`http://localhost:8000/get_user_groups/${userid}`);
        if (groupRes.ok) {
          const data = await groupRes.json();
          setGroups(data);
        }
      } else {
        toast.error("Failed to create group");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating group");
    }
  };

  // Modal for group creation
  const GroupModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96 relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={() => setShowGroupModal(false)}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Create Group</h2>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Group Name"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          autoFocus
        />
        <div className="mb-3">
          <div className="font-semibold mb-1">Select Members:</div>
          <div className="max-h-40 overflow-y-auto border rounded p-2">
            {contacts.map(user => (
              <label key={user.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={e => {
                    if (e.target.checked) setSelectedUsers(prev => [...prev, user.id]);
                    else setSelectedUsers(prev => prev.filter(id => id !== user.id));
                  }}
                />
                <span>{user.name}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
          onClick={handleCreateGroup}
        >Create Group</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full font-sans bg-gray-100 overflow-hidden">
      {showGroupModal && <GroupModal />}
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col border-r border-gray-200">
        <div className="p-4 font-bold text-xl flex justify-between items-center border-b border-gray-200">
          <span>CHAT</span>
          {LS.get("position") === "Manager" && (
            <FiPlus
              className="cursor-pointer text-gray-500 hover:text-blue-500 transition"
              onClick={() => setShowGroupModal(true)}
              title="Create Group"
            />
          )}
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2 shadow-inner hover:bg-gray-200 transition">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts / messages..."
              className="bg-transparent w-full focus:outline-none text-gray-700 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Groups & Contacts */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2 space-y-2">
          {/* Groups */}
          <div className="p-2 text-xs text-gray-500 uppercase tracking-wide">GROUPS</div>
          {filteredGroups.map(group => (
            <div
              key={group._id}
              className={clsx(
                "px-4 py-3 rounded-xl cursor-pointer flex items-center justify-between transition transform hover:scale-105 hover:bg-blue-50 shadow-sm",
                activeChat.chatId === group._id ? "bg-blue-100 font-semibold shadow-md" : ""
              )}
              onClick={() => handleGroupClick(group)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-gray-400 text-white shadow-lg">
                  {group.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span>{group.name}</span>
                  <span className="text-xs text-gray-400">{group.members?.filter(m => m !== userid).length} members</span>
                </div>
              </div>

              {LS.get("position")?.toLowerCase() === "manager" && (
                <button className="text-black-600 hover:underline" onClick={(e) => { e.stopPropagation(); handleRemoveGroup(group); }}>
                  <FiDelete />
                </button>
              )}
            </div>
          ))}

          {/* Contacts */}
          <div className="p-2 text-xs text-gray-500 uppercase tracking-wide mt-4">CONTACTS</div>
          {filteredContacts.map((contact) => {
            const chatId = buildChatId(userid, contact.id);
            const isOnline = onlineUsers.includes(contact.id);
            return (
              <div
                key={contact.id}
                className={clsx(
                  "px-4 py-3 rounded-xl cursor-pointer flex items-center justify-between transition transform hover:scale-105 hover:bg-blue-50 shadow-sm",
                  activeChat.chatId === chatId ? "bg-blue-100 font-semibold shadow-md" : ""
                )}
                onClick={() => handleContactClick(contact)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg transform transition-all duration-300",
                      isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    )}
                  >
                    {getInitials(contact.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{contact.name}</span>
                    </div>
                    <div className="text-xs text-gray-400">{contact.position || ""}</div>
                  </div>
                </div>
                {unread[chatId] > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow animate-bounce">{unread[chatId]}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
              {activeChat.id ? getInitials(activeChat.name) : "?"}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{activeChat.id ? activeChat.name : "Select a contact"}</h1>
              <p className="text-sm text-gray-500">{activeChat.id ? activeChat.id : userid}</p>
            </div>
          </div>
        </div>

        {/* Messages & Thread */}
        <div className="flex flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {activeMessages.map((m) => {
              const isSender = m.from_user === userid;
              const msgId = m.id || m.tempId;
              const reactionData = reactionsMap[msgId] || {};
              const textHtml = (m.text || "").replace(/@(\w+)/g, '<span class="text-blue-600 font-semibold">@$1</span>');
              return (
                <div key={msgId} className={clsx("flex transition-transform duration-300 transform", isSender ? "justify-end" : "justify-start")}>
                  <div className={clsx("max-w-xl p-4 rounded-2xl break-words shadow-lg relative transition-all duration-300", isSender ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none hover:shadow-xl" : "bg-white text-gray-800 rounded-bl-none hover:shadow-md")}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{isSender ? "You" : m.from_user}</span>
                      <span className="text-xs text-white-400">{formatTime(m.timestamp)}</span>
                    </div>
                    <div className="text-sm leading-snug" dangerouslySetInnerHTML={{ __html: textHtml }} />
                    <div className="flex items-center gap-3 mt-3">
                      <button className="text-xs text-white-500 hover:text-blue-600 transition" onClick={() => setSelectedThread(m)}>Reply</button>
                      <button className="text-xs text-gray-500 hover:text-green-600 transition flex items-center gap-1" onClick={() => toggleReaction(msgId, "👍")}>👍 {reactionData["👍"] || ""}</button>
                      <button className="text-xs text-gray-500 hover:text-red-600 transition flex items-center gap-1" onClick={() => toggleReaction(msgId, "❤️")}>❤️ {reactionData["❤️"] || ""}</button>
                      <div className="text-xs text-white-400 ml-auto">{(messages[`thread:${msgId}`] || []).length ? `${(messages[`thread:${msgId}`] || []).length} replies` : ""}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef}></div>
          </div>

          {/* Thread Panel */}
          <div className="w-80 border-l bg-white flex flex-col overflow-y-auto">
            {!selectedThread ? (
              <div className="p-4 text-gray-500">No thread selected — click "Reply" on a message to open thread</div>
            ) : (
              <>
                <div className="p-3 border-b font-semibold flex items-center gap-3">
                  <button className="p-1 rounded hover:bg-gray-100" onClick={() => setSelectedThread(null)}><FiChevronLeft /></button>
                  <div>
                    <div className="text-sm font-medium">Thread</div>
                    <div className="text-xs text-gray-400">{selectedThread.from_user} • {formatTime(selectedThread.timestamp, true)}</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="p-3 bg-gray-50 rounded">{selectedThread.text}</div>
                  {(messages[`thread:${selectedThread.id}`] || []).map((t) => (
                    <div key={t.id || t.tempId} className="p-3 border rounded">
                      <div className="text-xs text-gray-400 mb-1">{t.from_user} • {formatTime(t.timestamp, true)}</div>
                      <div>{t.text}</div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t flex items-center gap-3">
                  <input value={threadInput} onChange={(e) => setThreadInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendThreadMessage(); }} placeholder="Reply in thread..." className="flex-1 border rounded px-3 py-2" />
                  <button onClick={sendThreadMessage} className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700">Reply</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 p-3 border-t border-gray-200 relative">
          <button className="p-2 rounded-full hover:bg-gray-100 transition" onClick={() => setShowEmojiPicker(prev => !prev)}>
            <FiSmile className="text-gray-600" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-3 z-50 shadow-lg rounded-lg overflow-hidden">
              <Picker onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)} searchPlaceholder="Search emojis..." />
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="flex-1 p-2 rounded-full border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button
            onClick={sendMessage}
            disabled={(!newMessage.trim()) || !isConnected}
            className={`p-3 rounded-full transition ${newMessage.trim() && isConnected ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          >
            <FiSend />
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
