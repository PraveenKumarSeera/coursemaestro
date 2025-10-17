
'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { addMaterialLinkAction } from '@/app/actions/materials';
import { Button } from '@/components/ui/button';
import { Link2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                </>
            ) : (
                <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Add Material Link
                </>
            )}
        </Button>
    );
}

const initialState = {
    message: '',
    success: false,
};

type AddMaterialFormProps = {
  courseId: string;
  setDialogOpen: (isOpen: boolean) => void;
};

export default function AddMaterialForm({ courseId, setDialogOpen }: AddMaterialFormProps) {
    const [state, formAction] = useActionState(addMaterialLinkAction, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                formRef.current?.reset();
                setDialogOpen(false);
                router.refresh();
            }
        }
    }, [state, toast, setDialogOpen, router]);


    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="courseId" value={courseId} />
            <div className="space-y-2">
                <Label htmlFor="title">Material Title</Label>
                <Input id="title" name="title" required placeholder="e.g., Chapter 1 Slides" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="link">Shareable Link</Label>
                <Input
                    id="link"
                    name="link"
                    type="url"
                    required
                    placeholder="https://docs.google.com/..."
                />
                 <p className="text-sm text-muted-foreground">Make sure the link is publicly accessible or shared with your students.</p>
            </div>
             <SubmitButton />
        </form>
    );
}
