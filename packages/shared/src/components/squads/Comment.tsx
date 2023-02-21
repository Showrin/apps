import React, { FormEvent, ReactElement, useContext, useState } from 'react';
import { Modal } from '../modals/common/Modal';
import { Button } from '../buttons/Button';
import { ProfilePicture } from '../ProfilePicture';
import { Justify } from '../utilities';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import AuthContext from '../../contexts/AuthContext';
import OpenLinkIcon from '../icons/OpenLink';
import { SquadForm } from '../../graphql/squads';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

interface SquadCommentProps {
  onSubmit: React.EventHandler<FormEvent>;
  form: Partial<SquadForm>;
  isLoading?: boolean;
}

export function SquadComment({
  onSubmit,
  form,
  isLoading,
}: SquadCommentProps): ReactElement {
  const { post } = form.post;
  const { user } = useContext(AuthContext);
  const [commentary, setCommentary] = useState(form.commentary);

  return (
    <>
      <Modal.Body className="flex flex-col">
        <form
          onSubmit={onSubmit}
          className="flex flex-1 gap-4"
          id="squad-comment"
        >
          <ProfilePicture user={user} />
          <textarea
            placeholder="Share your thought and insights about the post…"
            className="w-full min-w-0 flex-1 resize-none self-stretch bg-transparent text-theme-label-primary caret-theme-label-link typo-body focus:placeholder-transparent focus:outline-none"
            value={commentary}
            onChange={(event) => setCommentary(event.target.value)}
            ref={(el) => {
              if (!el) return;

              el.focus();
            }}
          />
        </form>
        <div className="flex w-full items-center gap-4 rounded-12 border border-theme-divider-tertiary py-2 px-4">
          <p className="multi-truncate flex-1 text-theme-label-secondary typo-caption1 line-clamp-3">
            {post.title}
          </p>
          <Image
            src={post.image}
            className="h-16 w-16 rounded-16 object-cover laptop:w-24"
            loading="lazy"
            fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          />
          <a href={post.permalink} target="_blank">
            <OpenLinkIcon />
          </a>
        </div>
      </Modal.Body>
      <Modal.Footer justify={Justify.Between}>
        <div className="flex">
          <Image
            className="mr-3 h-8 rounded-full"
            src={form.file ?? cloudinary.squads.imageFallback}
          />
          <div>
            <h5 className="font-bold typo-caption1">{form.name}</h5>
            <h6 className="text-theme-label-tertiary typo-caption1">
              @{form.handle}
            </h6>
          </div>
        </div>
        <SimpleTooltip
          placement="left"
          disabled={!!commentary}
          content="Please add a comment before proceeding"
        >
          <div>
            <Button
              form="squad-comment"
              className="btn-primary-cabbage"
              type="submit"
              loading={isLoading}
              disabled={!commentary || isLoading}
            >
              Done
            </Button>
          </div>
        </SimpleTooltip>
      </Modal.Footer>
    </>
  );
}
