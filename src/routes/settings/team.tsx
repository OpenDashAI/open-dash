/**
 * Team Management UI
 *
 * Features:
 * - List team members (active + pending)
 * - Invite new members
 * - Remove members (soft delete)
 * - Change member roles
 *
 * Requires: owner or editor role
 */

import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import type { RouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/team")({
	component: TeamSettingsPage,
});

/**
 * Team member in list
 */
interface TeamMember {
	id: string;
	userId: string;
	role: "owner" | "editor" | "viewer";
	active: boolean;
	acceptedAt: number | null;
	email: string;
	firstName?: string;
	lastName?: string;
	avatar?: string;
}

/**
 * Team Settings Page Component
 */
const TeamSettingsPage: RouteComponent = () => {
	const [members, setMembers] = useState<TeamMember[]>([]);
	const [pendingInvites, setPendingInvites] = useState<TeamMember[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
	const [inviting, setInviting] = useState(false);

	// Load team members on mount
	const loadTeamMembers = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/orgs/members");
			if (!response.ok) throw new Error("Failed to load team members");

			const data = await response.json();
			setMembers(data.members || []);
			setPendingInvites(data.pendingInvites || []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Unknown error occurred"
			);
		} finally {
			setLoading(false);
		}
	};

	// Invite member
	const handleInvite = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inviteEmail.trim()) return;

		setInviting(true);
		setError(null);

		try {
			const response = await fetch("/api/orgs/members", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: inviteEmail,
					role: inviteRole,
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(error);
			}

			// Clear form + reload
			setInviteEmail("");
			setInviteRole("editor");
			await loadTeamMembers();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to send invite"
			);
		} finally {
			setInviting(false);
		}
	};

	// Remove member
	const handleRemove = async (memberId: string) => {
		if (!confirm("Remove this team member? They will lose access.")) return;

		setError(null);
		try {
			const response = await fetch(`/api/orgs/members/${memberId}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to remove member");

			// Reload members list
			await loadTeamMembers();
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to remove member"
			);
		}
	};

	return (
		<div className="space-y-8 p-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-white">Team Management</h1>
				<p className="text-gray-400 mt-2">
					Manage team members and permissions
				</p>
			</div>

			{/* Error message */}
			{error && (
				<div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded">
					{error}
				</div>
			)}

			{/* Invite section */}
			<div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
				<h2 className="text-xl font-semibold text-white mb-4">
					Invite Team Member
				</h2>

				<form onSubmit={handleInvite} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Email Address
						</label>
						<input
							type="email"
							value={inviteEmail}
							onChange={(e) => setInviteEmail(e.target.value)}
							placeholder="user@example.com"
							className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
							disabled={inviting}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Role
						</label>
						<select
							value={inviteRole}
							onChange={(e) =>
								setInviteRole(
									e.target.value as "editor" | "viewer"
								)
							}
							className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
							disabled={inviting}
						>
							<option value="editor">Editor (can edit)</option>
							<option value="viewer">Viewer (read-only)</option>
						</select>
					</div>

					<button
						type="submit"
						disabled={inviting || !inviteEmail.trim()}
						className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded font-medium"
					>
						{inviting ? "Sending..." : "Send Invite"}
					</button>
				</form>

				<div className="text-sm text-gray-400 mt-4">
					<p>
						📧 <strong>Owner</strong> can manage team and billing
					</p>
					<p>
						✏️ <strong>Editor</strong> can create and modify brands
					</p>
					<p>👁️ <strong>Viewer</strong> can view data only</p>
				</div>
			</div>

			{/* Active members section */}
			<div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
				<h2 className="text-xl font-semibold text-white mb-4">
					Active Members ({members.length})
				</h2>

				{loading && <p className="text-gray-400">Loading...</p>}

				{members.length === 0 && !loading ? (
					<p className="text-gray-400">No team members yet</p>
				) : (
					<div className="space-y-2">
						{members.map((member) => (
							<div
								key={member.id}
								className="flex items-center justify-between bg-gray-800 p-3 rounded border border-gray-700"
							>
								<div>
									<div className="font-medium text-white">
										{member.firstName} {member.lastName}
									</div>
									<div className="text-sm text-gray-400">
										{member.email}
									</div>
								</div>

								<div className="flex items-center gap-4">
									<span className="text-sm font-medium bg-gray-700 px-3 py-1 rounded">
										{member.role}
									</span>

									<button
										onClick={() => handleRemove(member.id)}
										className="text-sm text-red-400 hover:text-red-300"
									>
										Remove
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Pending invites section */}
			{pendingInvites.length > 0 && (
				<div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
					<h2 className="text-xl font-semibold text-white mb-4">
						Pending Invites ({pendingInvites.length})
					</h2>

					<div className="space-y-2">
						{pendingInvites.map((invite) => (
							<div
								key={invite.id}
								className="flex items-center justify-between bg-gray-800 p-3 rounded border border-yellow-700/30"
							>
								<div>
									<div className="font-medium text-white">
										{invite.email}
									</div>
									<div className="text-sm text-gray-400">
										Invited{" "}
										{invite.invitedAt
											? new Date(
													invite.invitedAt
												).toLocaleDateString()
											: "recently"}
									</div>
								</div>

								<div className="flex items-center gap-4">
									<span className="text-sm font-medium text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded">
										Pending
									</span>

									<button
										onClick={() => handleRemove(invite.id)}
										className="text-sm text-red-400 hover:text-red-300"
									>
										Cancel
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Help text */}
			<div className="text-sm text-gray-400 border-l-2 border-gray-700 pl-4">
				<p>
					<strong>Can't invite?</strong> Your plan may have reached
					the team member limit.
				</p>
				<p>
					<strong>Want more users?</strong> Upgrade to a higher plan
					in billing settings.
				</p>
			</div>
		</div>
	);
};
