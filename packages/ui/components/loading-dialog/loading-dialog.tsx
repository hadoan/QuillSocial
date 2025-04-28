import { Dialog, DialogContent } from "@radix-ui/react-dialog";

export function LoadingDialog({ open, text = "Loading" }: { open: boolean; text?: string }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Dialog open={open}>
        <DialogContent>
          <div className="text-center">
            <svg className="bg-awst text-awst mx-auto mb-3 h-8 w-8 animate-spin" viewBox="0 0 24 24"></svg>
            <p className="text-default ml-2 text-[16px]">{text}...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
