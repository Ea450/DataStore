"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { FileDetails, ShareInput } from "./ActionsModalContent";
const ActionDropdown = (file: FileDocument) => {
  const { $id, name, extension, bucketFileId } = file;

  const path = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [fileName, setFileName] = useState(name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);

  const closeAllModals = () => {
    setAction(null);
    setIsDropdownOpen(false);
    setIsModalOpen(false);
    setFileName(name);
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    let succes = false;
    const actions = {
      rename: () => renameFile({ fileId: $id, fileName, extension, path }),
      share: () => updateFileUsers({ fileId: $id, emails, path }),
      delete: () => deleteFile({ fileId: $id, path, bucketFileId }),
    };

    succes = await actions[action.value as keyof typeof actions]();
    if (succes) closeAllModals();
    setIsLoading(false);
  };
  const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);
    const success = await updateFileUsers({
      fileId: $id,
      emails: updatedEmails,
      path,
    });
    if (success) setEmails(updatedEmails);
    closeAllModals();
  };
  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;
    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure want to delete {` `}
              <span className="delete-file-name">{file.name}</span>
            </p>
          )}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button
              onClick={closeAllModals}
              className="modal-cancel-button primary-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className="primary-btn modal-submit-button "
            >
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((acctionItem) => (
            <DropdownMenuItem
              key={acctionItem.label}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(acctionItem);
                if (
                  ["rename", "share", "delete", "details"].includes(
                    acctionItem.value
                  )
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
              {acctionItem.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={acctionItem.icon}
                    alt={acctionItem.label}
                    width={30}
                    height={30}
                  />
                  {acctionItem.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={acctionItem.icon}
                    alt={acctionItem.label}
                    width={30}
                    height={30}
                  />
                  {acctionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
