import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function InformationDialog(props: {
  wordsCorrect: number;
  wordsSkipped: number;
  amountOfMinutes: number;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  statsSeen: () => void;
}) {
  return (
    <Dialog
      open={props.isDialogOpen}
      onOpenChange={(open) => props.setIsDialogOpen(open)}
    >
      <DialogContent className="sm:max-w-106.25 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Zeit aus!</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <p>Richtige Antworten: {props.wordsCorrect}</p>
          <p>Übersprungen: {props.wordsSkipped}</p>
          <p>Wörter insgesamt: {props.wordsCorrect + props.wordsSkipped}</p>
          <p>Gesamtzeit: {props.amountOfMinutes} Minuten</p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              props.setIsDialogOpen(false);
              props.statsSeen();
            }}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
